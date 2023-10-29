const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Dodaj uporabnika v ticket')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Uporabnik, ki bo dodan v ticket')
				.setRequired(true)),
	async execute(interaction) {
		const client = interaction.client;
		const locales = client.locales.commands.adduserjs;
		const user = interaction.options.getUser('user');
		const checkOne = await client.ticket.has(interaction.channelId);
		if (checkOne === false) {
			interaction.reply(locales.notActiveChannel);
			return;
		}
		userCheck(interaction, client, user);
	},
};

async function userCheck(interaction, client, user) {
	const locales = client.locales.commands.adduserjs;
	const ticketDatabaseNumber = await client.ticket.get(interaction.channelId);
	const ticketDatabase = await client.db.table(`tt_${ticketDatabaseNumber}`).get('info');
	const status = await ticketDatabase.dmChannel.includes(user.id);

	switch (status) {
	case true:
		interaction.reply(locales.userCheck.userInTicket);
		break;
	case false:
		addUserToTicket(interaction, user, ticketDatabaseNumber);
		break;
	}
}

async function addUserToTicket(interaction,	user, num) {
	const locales = interaction.client.locales.commands.adduserjs.addUserToTicket;
	const DM = await user.createDM();
	const hasTicket = await checkIfUserHasOpenTicket(interaction, DM);
	const ticketCreator = await interaction.client.db.table(`tt_${num}`).get('info.creatorId');
	const creator = await interaction.client.users.fetch(ticketCreator);
	const username = await interaction.client.hasNewUsername(creator, true, 'user');
	if (hasTicket === true) {
		interaction.reply(locales.userHasTicket);
		return;
	}
	const embed = new EmbedBuilder()
		.setTitle(locales.embed.title)
		.setDescription((locales.embed.description)
			.replace('USERNAME', username));
	const button = new ButtonBuilder()
		.setCustomId('onlyMark')
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary)
		.setLabel(locales.button.lable);
	const acrow = new ActionRowBuilder()
		.addComponents(button);
	try {
		await DM.send({ embeds: [embed], components: [acrow] });
	}
	catch (e) {
		console.log(e);
		interaction.reply(locales.error);
		return;
	}
	await databaseSync(interaction, DM, num);
	interaction.reply((locales.added)
		.replace('USERNAME', `<@${user.id}>`));
}

async function databaseSync(interaction, DM, num) {
	await interaction.client.ticket.set(DM.id, num);
	await interaction.client.db.table(`tt_${num}`).push('info.dmChannel', DM.id);
}
async function checkIfUserHasOpenTicket(interaction, DM) {
	const status = await interaction.client.ticket.has(DM.id);
	if (status === true) return true;
	if (status === false) return false;
	return undefined;
}