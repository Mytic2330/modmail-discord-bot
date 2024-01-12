import {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	User,
	DMChannel,
	CommandInteraction,
	ChannelType,
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Dodaj uporabnika v ticket')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('Uporabnik, ki bo dodan v ticket')
				.setRequired(true),
		),
	async execute(interaction: CommandInteraction) {
		const locales = lib.locales.commands.adduserjs;
		const user = interaction.options.getUser('user');
		if (user) {
			const checkOne = await lib.ticket.has(interaction.channelId);
			if (checkOne === false) {
				interaction.reply({ ephemeral: true, content: locales.notActiveChannel });
				return;
			}
			userCheck(interaction, user);
		}
	},
};

async function userCheck(
	interaction: CommandInteraction,
	user: User,
) {
	const locales = lib.locales.commands.adduserjs;
	const ticketDatabaseNumber = await lib.ticket.get(interaction.channelId);
	const ticketDatabase = await lib.db
		.table(`tt_${ticketDatabaseNumber}`)
		.get('info');
	const status = await ticketDatabase.dmChannel.includes(user.id);

	switch (status) {
	case true:
		interaction.reply({ ephemeral: true, content: locales.userCheck.userInTicket });
		break;
	case false:
		addUserToTicket(interaction, user, ticketDatabaseNumber);
		break;
	}
}

async function addUserToTicket(
	interaction: CommandInteraction,
	user: User,
	num: number,
) {
	const locales = lib.locales.commands.adduserjs.addUserToTicket;
	const DM = await user.createDM();
	const hasTicket = await checkIfUserHasOpenTicket(DM);
	const ticketCreator = await lib.db.table(`tt_${num}`).get('info.creatorId');
	const creator = await interaction.client.users.fetch(ticketCreator);
	const username = await lib.hasNewUsername(creator, true, 'user');
	if (hasTicket === true) {
		interaction.reply({ ephemeral: true, content: locales.userHasTicket });
		return;
	}
	const embed = new EmbedBuilder()
		.setTitle(locales.embed.title)
		.setDescription(locales.embed.description.replace('USERNAME', username));
	const button = new ButtonBuilder()
		.setCustomId('onlyMark')
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary)
		.setLabel(locales.button.lable);
	const acrow: any = new ActionRowBuilder().addComponents(button);
	try {
		await DM.send({ embeds: [embed], components: [acrow] });
	}
	catch (e) {
		console.error(e);
		interaction.reply({ ephemeral: true, content: locales.error });
		return;
	}
	await sendToAllChannels(interaction, user, num);
	await databaseSync(DM, num);
	interaction.reply({ ephemeral: true, content: locales.added.replace('USERNAME', `<@${user.id}>`) });
}

async function databaseSync(
	DM: DMChannel,
	num: number,
) {
	await lib.ticket.set(DM.id, num);
	await lib.db.table(`tt_${num}`).push('info.dmChannel', DM.id);
}
async function checkIfUserHasOpenTicket(
	DM: DMChannel,
) {
	const status = await lib.ticket.has(DM.id);
	if (status === true) return true;
	if (status === false) return false;
	return undefined;
}

async function sendToAllChannels(interaction: CommandInteraction, user: User, number: number) {
	const locales = lib.locales.commands.adduserjs.addUserToTicket.sendToEveryChannel;
	const client = interaction.client;
	const embed = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle(locales.title)
		.setDescription((locales.description.replace('USER', user)))
		.setFooter({ text: (locales.footer.text).replace('USERNAME', interaction.user.username).replace('USERID', interaction.user.id) });

	const allUsers = await lib.db.table(`tt_${number}`).get('info');

	const guildChannel = await client.channels.fetch(allUsers.guildChannel);

	if (guildChannel && guildChannel.type === ChannelType.GuildText) {
		guildChannel.send({ embeds: [embed] });
	}

	for (const id of allUsers.dmChannel) {
		try {
			const channel = await client.channels.fetch(id);
			if (channel && channel.type === ChannelType.DM) {
				try {
					channel.send({ embeds: [embed] });
				}
				catch (e) {
					continue;
				}
			}
		}
		catch (e) {
			console.error(e);
		}
	}
}
