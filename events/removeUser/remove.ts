import { Events, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, User, DMChannel, Interaction, Client, Channel, Snowflake, StringSelectMenuInteraction, SelectMenuInteraction } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'removeUser') return;
		const client: Client = interaction.client;
		const chan: Channel | null = await client.channels.fetch(interaction.values[0]);
		const dm = chan as DMChannel;
		const user = dm?.recipient;
		userCheck(interaction, user, dm);
	},
};

async function userCheck(passedInteraction: Interaction, user: User | null, dm: DMChannel) {
	const interaction = passedInteraction as StringSelectMenuInteraction
	const locales = lib.locales.events.removejs;
	const channelId: Snowflake = interaction.channelId || "0"
	const ticketDatabaseNumber: number | null = await lib.ticket.get(channelId) || 0;
	const ticketDatabase = await lib.db.table(`tt_${ticketDatabaseNumber}`).get('info');
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

async function removeUserFromTicket(interaction: StringSelectMenuInteraction, user: User | null, num: number) {
	const locales = lib.locales.events.removejs;
	const DM = await user?.createDM();
	const embed = new EmbedBuilder()
		.setTitle(locales.embed.title)
		.setDescription(locales.embed.description);
	const openNewTicket = new ButtonBuilder()
		.setCustomId('openNewTicketButtonRemoved')
		.setLabel(locales.openNewTicket.lable)
		.setStyle(ButtonStyle.Primary);
	const openRow: any = new ActionRowBuilder()
		.addComponents(openNewTicket);
	try {
		await DM?.send({ embeds: [embed], components: [openRow] });
	}
	catch (e) {
		console.error(e);
	}
	databaseSync(DM, num);
	interaction.reply({ content: locales.userRemoved, ephemeral: true });
}

async function databaseSync(dm: DMChannel | undefined, num: number) {
	if (dm) {
		await lib.ticket.delete(dm.id);
		await lib.db.table(`tt_${num}`).pull('info.dmChannel', dm.id);
	}
}