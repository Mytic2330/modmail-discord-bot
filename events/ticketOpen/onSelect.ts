/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Events,
	ChannelType,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	Client,
	StringSelectMenuInteraction,
	Guild,
	CategoryChannel,
	TextChannel,
	GuildMember,
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: StringSelectMenuInteraction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'ticket') return;
		await interaction.deferReply({ ephemeral: true });
		const client = interaction.client;
		const locales = lib.locales.events.onSelectMenuInteractionjs;
		const blacklist: Array<string> | null = await lib.ticket.get('blacklist');
		if (blacklist!.includes(interaction.user.id)) {
			const embed = new EmbedBuilder()
				.setColor(await lib.db.get('color.default'))
				.setTitle('Blacklist')
				.setDescription(
					'Bili ste blacklistani.\n Torej možnosti odpiranja ticketa nimate!',
				)
				.setTimestamp();
			await interaction.editReply({ embeds: [embed] });
			return;
		}
		checkStatus(interaction, client, locales);
	},
};
async function checkStatus(
	interaction: StringSelectMenuInteraction,
	client: Client,
	locales: any,
) {
	const channelStatus = await lib.ticket.has(interaction.channelId);
	if (channelStatus === false) {
		if (await lib.ticket.has('users')) {
			const userAlreadyProcessing = await lib.ticket.get('users');
			if (userAlreadyProcessing.includes(interaction.user.id) === true) {
				const embed = new EmbedBuilder()
					.setColor(await lib.db.get('color.default'))
					.setTitle(locales.ticketAlreadyInMakingEmbed.title)
					.setTimestamp();
				await interaction.editReply({ embeds: [embed] });
				return;
			}
		}
		await lib.ticket.push('users', interaction.user.id);

		const preparing = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle(locales.ticketNowInMaking.title)
			.setDescription(locales.ticketNowInMaking.description)
			.setTimestamp();

		await interaction.message.edit({ embeds: [preparing], components: [] });
		const guildId = await lib.db.get('guildId');
		const guild = await client.guilds.fetch(guildId);
		createChannel(guild, interaction);
	}
	if (channelStatus === true) {
		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle(locales.ticketAlreadyOpen.title)
			.setTimestamp();
		await interaction.editReply({ embeds: [embed] });
		return;
	}
}

async function createChannel(
	guild: Guild,
	interaction: StringSelectMenuInteraction,
) {
	const data = await lib.db.get(guild.id);
	const passedCategory = await guild.channels.fetch(data.categoryId);
	const category = passedCategory as CategoryChannel;
	const username = await lib.hasNewUsername(interaction.user, true, 'user');
	const name = `${interaction.values[0]}-${username}`;
	try {
		const channel = await category?.children.create({
			name: name,
			type: ChannelType.GuildText,
		});
		sendInitial(channel, interaction);
	}
	catch (e) {
		console.error(e);
	}
}

async function sendInitial(
	x: TextChannel,
	interaction: StringSelectMenuInteraction,
) {
	const locales = lib.locales.events.onSelectMenuInteractionjs.initialOpening;
	const member = await x.guild.members.fetch(interaction.user.id);
	const num = await ticketNumberCalculation(interaction, x);

	const color = await lib.db.get('color.default');
	logInteraction(x, member, num);
	const embed = new EmbedBuilder()
		.setAuthor({
			name: interaction.user.username,
			iconURL: member.user.displayAvatarURL(),
		})
		.setColor(color)
		.setTitle(locales.logEmbed.title.replace('CATEGORY', interaction.values[0]))
		.setTimestamp()
		.addFields(
			{ name: locales.logEmbed.ticketNumber, value: `${num}`, inline: true },
			{
				name: locales.logEmbed.userProfile,
				value: `${member.user}`,
				inline: true,
			},
		)
		.setFooter({
			text: locales.logEmbed.footer.text.replace('USERID', interaction.user.id),
		});
	if (await lib.db.get('vactarCommunityID')) {
		embed.addFields({
			name: locales.logEmbed.vactar,
			value: locales.logEmbed.openHere.replace(
				'LINK',
				`https://app.vactar.io/communities/${await lib.db.get(
					'vactarCommunityID',
				)}/players/identifiers?search=${member.user.id}`,
			),
			inline: true,
		});
	}
	const select = new ButtonBuilder()
		.setCustomId('closeByOpen')
		.setLabel(locales.button.lable)
		.setStyle(ButtonStyle.Danger);

	const row: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
		select,
	);
	try {
		const mes = await x.send({ embeds: [embed], components: [row] });
		await mes.pin();
		x.bulkDelete(1);
	}
	catch (e) {
		console.error(e);
	}

	const embed2 = new EmbedBuilder()
		.setColor(color)
		.setTitle(locales.channelEmbed.title)
		.setTimestamp();
	await interaction.editReply({ embeds: [embed2] });
	databaseSync(interaction, x, num);
}

async function logInteraction(
	x: TextChannel,
	member: GuildMember,
	num: number,
) {
	const locales = lib.locales.events.onSelectMenuInteractionjs.initialOpening;
	const data = await lib.db.get(x.guildId);
	const passedChannel = await x.guild.channels.fetch(data.logChannel);
	const channel = passedChannel as TextChannel;
	const wbh = await lib.wbh(channel);

	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.displayAvatarURL(),
		})
		.setColor(await lib.db.get('color.default'))
		.setTitle(
			locales.otherLogEmbed.title.replace('USERNAME', member.user.username),
		)
		.setTimestamp()
		.addFields(
			{
				name: locales.otherLogEmbed.ticketNumber,
				value: `${num}`,
				inline: true,
			},
			{
				name: locales.otherLogEmbed.userProfile,
				value: `${member.user}`,
				inline: true,
			},
		)
		.setFooter({ text: locales.otherLogEmbed.footer.text });

	wbh?.send({ embeds: [embed] });
}

async function databaseSync(
	interaction: StringSelectMenuInteraction,
	x: TextChannel,
	num: number,
) {
	await lib.ticket.pull('users', interaction.user.id);
	const newTable = lib.db.table(`tt_${num}`);
	await newTable.set('info', {
		guildChannel: x.id,
		dmChannel: [interaction.channelId],
		creatorId: interaction.user.id,
		closed: false,
	});
	await lib.ticket.set(x.id, num);
	await lib.ticket.set(interaction.channelId, num);
	await newTable.set('analytics', {
		date: lib.datestamp(),
		time: lib.timestamp(),
		rating: null,
	});
	await newTable.set('messageAnalitys', {
		messages: {
			sentByDM: 0,
			sentByServer: 0,
			serverMessagesUsers: [],
			DMMessagesUsers: [],
		},
	});
	await newTable.set('activity', {
		lastServerMessage: null,
		lastDMMessage: null,
	});
	await lib.ticket.push('tickets', num);
	await lib.ticket.push('openTickets', num);
}

async function ticketNumberCalculation(
	interaction: StringSelectMenuInteraction,
	x: TextChannel,
) {
	let num = await lib.db.get('ticketNumber');
	if (num) {
		await lib.db.set('ticketNumber', num + 1);
	}
	else {
		num = interaction.channelId + x.id;
		await lib.db.set('ticketNumber', 1);
	}
	return num;
}
