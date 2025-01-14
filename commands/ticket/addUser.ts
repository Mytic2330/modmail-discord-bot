/* eslint-disable no-inline-comments */
import {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	User,
	DMChannel,
	CommandInteraction,
	ChannelType
} from 'discord.js';
import lib from '../../bridge/bridge';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Dodaj uporabnika v ticket') // Set command description
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('Uporabnik, ki bo dodan v ticket') // Set user option description
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		const locales = lib.locales.commands.adduserjs;
		const user = interaction.options.getUser('user');
		if (user) {
			const checkOne = await lib.ticket.has(interaction.channelId); // Check if the channel is a ticket
			if (checkOne === false) {
				interaction.reply({
					ephemeral: true,
					content: locales.notActiveChannel // Reply if the channel is not active
				});
				return;
			}
			userCheck(interaction, user); // Check the user
		}
	}
};

async function userCheck(interaction: CommandInteraction, user: User) {
	const locales = lib.locales.commands.adduserjs;
	const ticketDatabaseNumber = await lib.ticket.get(interaction.channelId); // Get ticket number
	const ticketDatabase = await lib.db
		.table(`tt_${ticketDatabaseNumber}`)
		.get('info'); // Get ticket info
	const status = await ticketDatabase.dmChannel.includes(user.id); // Check if user is in the ticket

	switch (status) {
		case true:
			interaction.reply({
				ephemeral: true,
				content: locales.userCheck.userInTicket // Reply if user is already in the ticket
			});
			break;
		case false:
			addUserToTicket(interaction, user, ticketDatabaseNumber); // Add user to the ticket
			break;
	}
}

async function addUserToTicket(
	interaction: CommandInteraction,
	user: User,
	num: number
) {
	const locales = lib.locales.commands.adduserjs.addUserToTicket;
	const DM = await user.createDM(); // Create a DM channel with the user
	const hasTicket = await checkIfUserHasOpenTicket(DM); // Check if user has an open ticket
	const ticketCreator = await lib.db.table(`tt_${num}`).get('info.creatorId'); // Get ticket creator ID
	const creator = await interaction.client.users.fetch(ticketCreator); // Fetch ticket creator
	const username = await lib.hasNewUsername(creator, true, 'user'); // Get username
	if (hasTicket === true) {
		interaction.reply({ ephemeral: true, content: locales.userHasTicket }); // Reply if user has an open ticket
		return;
	}
	const embed = new EmbedBuilder()
		.setTitle(locales.embed.title)
		.setDescription(
			locales.embed.description.replace('USERNAME', username) // Set embed description
		);
	const button = new ButtonBuilder()
		.setCustomId('onlyMark')
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary)
		.setLabel(locales.button.lable); // Create a button
	const acrow: any = new ActionRowBuilder().addComponents(button); // Create an action row
	try {
		await DM.send({ embeds: [embed], components: [acrow] }); // Send embed and button to the user
	} catch (e) {
		console.error(e);
		interaction.reply({ ephemeral: true, content: locales.error }); // Reply if there is an error
		return;
	}
	await sendToAllChannels(interaction, user, num); // Send message to all channels
	await databaseSync(DM, num); // Sync database
	interaction.reply({
		ephemeral: true,
		content: locales.added.replace('USERNAME', `<@${user.id}>`) // Reply with success message
	});
}

async function databaseSync(DM: DMChannel, num: number) {
	await lib.ticket.set(DM.id, num); // Set ticket in the database
	await lib.db.table(`tt_${num}`).push('info.dmChannel', DM.id); // Push DM channel ID to the database
}

async function checkIfUserHasOpenTicket(DM: DMChannel) {
	const status = await lib.ticket.has(DM.id); // Check if user has an open ticket
	if (status === true) return true;
	if (status === false) return false;
	return undefined;
}

async function sendToAllChannels(
	interaction: CommandInteraction,
	user: User,
	number: number
) {
	const locales =
		lib.locales.commands.adduserjs.addUserToTicket.sendToEveryChannel;
	const client = interaction.client;
	const embed = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle(locales.title)
		.setDescription(locales.description.replace('USER', user)) // Set embed description
		.setFooter({
			text: locales.footer.text
				.replace('USERNAME', interaction.user.username)
				.replace('USERID', interaction.user.id) // Set embed footer
		});

	const allUsers = await lib.db.table(`tt_${number}`).get('info'); // Get all users in the ticket

	const guildChannel = await client.channels.fetch(allUsers.guildChannel); // Fetch guild channel

	if (guildChannel && guildChannel.type === ChannelType.GuildText) {
		guildChannel.send({ embeds: [embed] }); // Send embed to guild channel
	}

	for (const id of allUsers.dmChannel) {
		try {
			const channel = await client.channels.fetch(id); // Fetch DM channel
			if (channel && channel.type === ChannelType.DM) {
				try {
					channel.send({ embeds: [embed] }); // Send embed to DM channel
				} catch (e) {
					continue;
				}
			}
		} catch (e) {
			console.error(e);
		}
	}
}
