import {
	Events,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	User,
	DMChannel,
	Interaction,
	Client,
	Channel,
	Snowflake,
	StringSelectMenuInteraction,
	ChannelType,
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'removeUser') return;
		const client: Client = interaction.client;
		const chan: Channel | null = await client.channels.fetch(
			interaction.values[0],
		);
		interaction.deferReply({ ephemeral: true });
		const dm = chan as DMChannel;
		const user = dm?.recipient;
		userCheck(interaction, user!, dm);
	},
};

async function userCheck(
	passedInteraction: Interaction,
	user: User,
	dm: DMChannel,
) {
	const interaction = passedInteraction as StringSelectMenuInteraction;
	const locales = lib.locales.events.removejs;
	const channelId: Snowflake = interaction.channelId || '0';
	const ticketDatabaseNumber: number | null =
    (await lib.ticket.get(channelId)) || 0;
	const ticketDatabase = await lib.db
		.table(`tt_${ticketDatabaseNumber}`)
		.get('info');
	const status = await ticketDatabase.dmChannel.includes(dm.id);

	switch (status) {
	case false:
		interaction.editReply({ content: locales.userNotInTicket });
		break;
	case true:
		removeUserFromTicket(interaction, user, ticketDatabaseNumber);
		break;
	}
}

async function removeUserFromTicket(
	interaction: StringSelectMenuInteraction,
	user: User,
	num: number,
) {
	const locales = lib.locales.events.removejs;
	const DM = await user?.createDM();
	const embed = new EmbedBuilder()
		.setTitle(locales.embed.title)
		.setDescription(locales.embed.description);
	const openNewTicket = new ButtonBuilder()
		.setCustomId('openNewTicketButtonRemoved')
		.setLabel(locales.openNewTicket.lable)
		.setStyle(ButtonStyle.Primary);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const openRow: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(openNewTicket);
	try {
		await DM?.send({ embeds: [embed], components: [openRow] });
	}
	catch (e) {
		console.error(e);
	}
	await sendToAllChannels(interaction, user, num);
	databaseSync(DM, num);
	interaction.editReply({ content: locales.userRemoved });
}

async function databaseSync(dm: DMChannel | undefined, num: number) {
	if (dm) {
		await lib.ticket.delete(dm.id);
		await lib.db.table(`tt_${num}`).pull('info.dmChannel', dm.id);
	}
}

async function sendToAllChannels(interaction: StringSelectMenuInteraction, user: User, number: number) {
	const locales = lib.locales.events.removejs.sentToAllChannels;
	const client = interaction.client;
	const embed = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle(locales.title)
		.setDescription((locales.description).replace('USER', user))
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
