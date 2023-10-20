const { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'removeUser') return;
		const client = interaction.client;
		const dm = await client.channels.fetch(interaction.values[0]);
		const user = await dm.recipient;
		userCheck(interaction, client, user, dm);
	},
};

async function userCheck(interaction, client, user, dm) {
	const locales = interaction.client.locales.events.removejs;
	const ticketDatabaseNumber = await client.ticket.get(interaction.channelId);
	const ticketDatabase = await client.db.table(`tt_${ticketDatabaseNumber}`).get('info');
	const status = await ticketDatabase.dmChannel.includes(dm.id);

	switch (status) {
	case false:
		interaction.reply({ content: locales.userNotInTicket, ephemeral: true });
		break;
	case true:
		removeUserFromTicket(interaction, user, ticketDatabaseNumber);
		break;
	}

}

async function removeUserFromTicket(interaction, user, num) {
	const locales = interaction.client.locales.events.removejs;
	const DM = await user.createDM();
	const embed = new EmbedBuilder()
		.setTitle(locales.embed.title)
		.setDescription(locales.embed.description);
	const openNewTicket = new ButtonBuilder()
		.setCustomId('openNewTicketButtonRemoved')
		.setLabel(locales.openNewTicket.lable)
		.setStyle(ButtonStyle.Primary);
	const openRow = new ActionRowBuilder()
		.addComponents(openNewTicket);
	try {
		await DM.send({ embeds: [embed], components: [openRow] });
		databaseSync(interaction, DM, num);
		interaction.reply({ content: locales.userRemoved, ephemeral: true });
	}
	catch (e) {
		console.log(e);
	}
}

async function databaseSync(interaction, DM, num) {
	await interaction.client.ticket.delete(DM.id);
	await interaction.client.db.table(`tt_${num}`).pull('info.dmChannel', DM.id);
}