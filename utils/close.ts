export default close
const discordTranscripts = require('discord-html-transcripts');
import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Embed, Client, TextChannel, Interaction, DMChannel, CommandInteraction, ButtonInteraction } from 'discord.js';
import lib from '../bridge/bridge';
import { AnyARecord } from 'dns';

async function close(base: any, type:string, num: number | null) {
	// BASIC DEFINING
	var ina;
	var client;
	var interaction;
	var number;
	var channelId;
	var closeUser;
	// CHECK TYPE
	if (type == 'ina') {
		//ina = true;
		client = base
		interaction = null
	}
	else if (type == 'cls') {
		//ina = false;
		interaction = base
		client = interaction.client
	}
	else {
		return;
	}
	// DEFFER IF INTERACTION
	if (!ina && interaction) { await interaction.deferReply({ ephemeral: true }); }
	const locales = lib.locales.utils.closejs;
	// CHECK IF TICKET IS VALID
	if (!await lib.ticket.has(base.channelId) && !ina) {
		base.editReply(locales.wrongChannel);
		return;
	}
	// DATABASE DEFINING
	if (ina) { number = num; }
	else {number = await lib.ticket.get(base.channelId); }
	const data = await lib.db.table(`tt_${number}`).get('info');
	if (ina) { channelId = data.guildChannel; }
	else { channelId = base.channelId; }
	// CHECK FOR DUPLICATE INTERACTIONS
	const st = await lib.ticket.get('closing');
	if (!st) {
		await lib.ticket.set('closing', []);
	}
	else if (st.includes(number)) {
		if (!ina) { base.editReply(locales.ticketAlreadyClosing); }
		return;
	}
	// PREVENT DUPLICATE STARTS
	await setClosing(client, number);
	// INFO DEFINING
	const guild = await client.guilds.fetch(await lib.db.get('guildId'));
	const channel = await guild.channels.fetch(channelId);
	const author = await client.users.fetch(data.creatorId);
	const gData = await lib.db.get(guild.id);
	const logChannel = await client.channels.fetch(gData.logChannel);
	const archive = await client.channels.fetch(gData.transcriptChannel);
	if (ina) { closeUser = { 'username': 'Neaktivnost', 'id': '0' }; }
	else { closeUser = { 'username': base.user.username, 'id': base.user.id }; }
	// GET ALL USERS IN TICKET
	const users = await getAllUsers(client, data);

	// ROW BUILDING
	const RowData = { 'locales': locales, 'number': number }
	const creatorRow = await buildRow('rate', RowData);
	const deleteRow = await buildRow('delete', RowData);
	const openRow = await buildRow('new', RowData);
	const openRowRemoved = await buildRow('newremoved', RowData);
	// EMBED BUILDING
	const embedData = { 'locales': locales, 'users': users, 'closeUser': closeUser, 'client': client, 'number': number, 'author': author.username };
	const closeLog = await embedBuilder('log', embedData);
	const closeEmbed = await embedBuilder('close', embedData);
	const creatorClose = await embedBuilder('creator', embedData);
	const closeDmEmbed = await embedBuilder('dm', embedData);
	// TRANSCRIPT BULDING
	const attachment = await discordTranscripts.createTranscript(channel, {
		limit: -1,
		returnType: 'attachment',
		filename: `${author.username}.htm`,
		saveImages: true,
		footerText: 'Made by mytic2330',
		poweredBy: false,
	});
	// LOG WEBHOOK DEFINING
	const wbh = await lib.wbh(logChannel);
	const wbhArchive = await lib.wbh(archive);
	// TRANSCRIPT ARCHIVING
	const message = await wbhArchive?.send({ files: [attachment] });
	const obj = message?.attachments.values().next().value;
	// ADDING TRANSCRIPT LINK TO LOG EMBEDS
	closeLog?.addFields({ name: locales.transcriptField.name, value: (locales.transcriptField.value).replace('LINK', obj.url) });
	closeEmbed?.addFields({ name: locales.transcriptField.name, value: (locales.transcriptField.value).replace('LINK', obj.url) });
	// COMPACTING STRUCTURE
	const embeds = { 'closeLog': closeLog, 'closeEmbed': closeEmbed, 'creatorClose': creatorClose, 'closeDmEmbed': closeDmEmbed };
	const rows = { 'creatorRow': creatorRow, 'deleteRow': deleteRow, 'openRow': openRow, 'openRowRemoved': openRowRemoved };
	const compactData = { 'channel': channel, 'wbh': wbh, 'dmChannels': data.dmChannel, 'client': client, 'creatorId': data.creatorId };
	// SEND ALL CLOSE EMBEDS
	await sendSwitch(embeds, rows, compactData);
	// UPDATE DATABASE
	dataSetUpdate(number, data, client, obj, channel, gData);
	// FINISHING
	unsetClosing(client, number);
	if (!ina) {base.editReply('Ticket closed!');}
}

async function sendSwitch(embeds: any, rows: any, compactData: any) {
	try {
		compactData.wbh.send({ embeds: [embeds.closeLog] });
	}
	catch (e) {
		console.error(e);
	}
	try {
		compactData.channel.send({ embeds: [embeds.closeEmbed], components: [rows.deleteRow] });
	}
	catch (e) {
		console.error(e);
	}
	for (const id of compactData.dmChannels) {
		const dm = await compactData.client.channels.fetch(id);
		try {
			if (dm.recipientId === compactData.creatorId) {
				await dm.send({ embeds: [embeds.creatorClose], components: [rows.creatorRow, rows.openRow] });
			}
			else {
				await dm.send({ embeds: [embeds.closeDmEmbed], components: [rows.openRowRemoved] });
			}
		}
		catch (e) {
			console.error(e);
		}
	}
}

async function setClosing(client: any, number: number) {
	await client.ticket.push('closing', number);
}

async function unsetClosing(client: any, number: number) {
	await client.ticket.pull('inaQueue', number);
}

async function buildRow(type: string, data: { locales: any, number: number | null}) {
	const locales = data.locales;
	const number = data.number;
	if (type == 'delete') {
		const deleteButton = new ButtonBuilder()
			.setCustomId('delete')
			.setLabel(locales.deleteButton.lable)
			.setEmoji(locales.deleteButton.emoji)
			.setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder()
			.addComponents(deleteButton);

		return row;
	}
	if (type == 'rate') {
		const rate5 = new ButtonBuilder()
			.setCustomId(`rat5_${number}`)
			.setEmoji(locales.ratebutton.ratew5.emoji)
			.setLabel(locales.ratebutton.ratew5.lable)
			.setStyle(ButtonStyle.Secondary);
		const rate4 = new ButtonBuilder()
			.setCustomId(`rat4_${number}`)
			.setEmoji(locales.ratebutton.ratew4.emoji)
			.setLabel(locales.ratebutton.ratew4.lable)
			.setStyle(ButtonStyle.Secondary);
		const rate3 = new ButtonBuilder()
			.setCustomId(`rat3_${number}`)
			.setEmoji(locales.ratebutton.ratew3.emoji)
			.setLabel(locales.ratebutton.ratew3.lable)
			.setStyle(ButtonStyle.Secondary);
		const rate2 = new ButtonBuilder()
			.setCustomId(`rat2_${number}`)
			.setEmoji(locales.ratebutton.ratew2.emoji)
			.setLabel(locales.ratebutton.ratew2.lable)
			.setStyle(ButtonStyle.Secondary);
		const rate1 = new ButtonBuilder()
			.setCustomId(`rat1_${number}`)
			.setEmoji(locales.ratebutton.ratew1.emoji)
			.setLabel(locales.ratebutton.ratew1.lable)
			.setStyle(ButtonStyle.Secondary);
		const row = new ActionRowBuilder()
			.addComponents(rate5)
			.addComponents(rate4)
			.addComponents(rate3)
			.addComponents(rate2)
			.addComponents(rate1);

		return row;
	}
	if (type == 'new') {
		const openNewTicket = new ButtonBuilder()
			.setCustomId('openNewTicketButton')
			.setLabel(locales.newTicketButton.lable)
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder()
			.addComponents(openNewTicket);

		return row;
	}
	if (type == 'newremoved') {
		const openNewTicketRemoved = new ButtonBuilder()
			.setCustomId('openNewTicketButtonRemoved')
			.setLabel(locales.newTicketButtonRemoved.lable)
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder()
			.addComponents(openNewTicketRemoved);

		return row;
	}
}

async function embedBuilder(type: string, data: { 'locales': any, 'users': any, 'closeUser': any, 'client': any, 'number': number, 'author': string }) {
	const locales = data.locales;
	const client = data.client;
	const color = await client.db.get('color.close');
	const users = data.users;
	const number = data.number;
	const closeUser = data.closeUser;
	const author = data.author;

	if (type == 'close') {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(locales.closeEmbed.title)
			.addFields({ name: ' ', value: locales.closeEmbed.field.value }, { name: 'Ticket ID', value: `${number}`, inline: true })
			.addFields({ name: 'Uporabniki v ticketu', value: `${users}`, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeEmbed.footer.text).replace('USERNAME', closeUser.username).replace('ID', closeUser.id) });
		return embed;
	}
	if (type == 'log') {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle((locales.closeLog.title).replace('CHANNELNAME', author))
			.addFields({ name: ' ', value: locales.closeLog.field.value }, { name: 'Ticket ID', value: `${number}`, inline: true })
			.addFields({ name: 'Uporabniki v ticketu', value: `${users}`, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeLog.footer.text).replace('USERNAME', closeUser.username).replace('ID', closeUser.id) });
		return embed;
	}
	if (type == 'creator') {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(locales.creatorClose.title)
			.addFields({ name: ' ', value: locales.creatorClose.field.value, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.creatorClose.footer.text).replace('USERNAME', closeUser.username).replace('ID', closeUser.id) });
		return embed;
	}
	if (type == 'dm') {
		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(locales.closeDM.title)
			.setDescription(locales.closeDM.description)
			.setTimestamp();
		return embed;
	}
}

async function dataSetUpdate(number: number, data: { dmChannel: any, guildChannel: any }, client: Client, obj: any, channel: TextChannel, gData: any) {
	moveTicket(channel, gData);
	for (const id of data.dmChannel) {
		await lib.ticket.delete(id);
	}
	await lib.ticket.delete(data.guildChannel);
	await lib.db.table(`tt_${number}`).set('info.closed', true);
	await lib.db.table(`tt_${number}`).set('info.transcript', `${obj.url}`);
	await lib.ticket.pull('closing', number);
}

async function getAllUsers(client: Client, data: { dmChannel: any}) {
	const arr = [];
	for (const id of data.dmChannel) {
		const dm: any = await client.channels.fetch(id);
		const user = dm?.recipient;
		arr.push(user);
	}

	if (arr.length === 0) return 'err';
	const string = arr.join('\n');
	return string;
}

async function moveTicket(channel: TextChannel, gData: any) {
	const parent = gData.closeCategoryId;
	await channel.setParent(parent, { lockPermissions: false });
}