module.exports = { close };
const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function close(interaction) {
	const client = interaction.client;
	const locales = client.locales.utils.closejs;
	await interaction.deferReply({ ephemeral: true });

	if (!await client.ticket.has(interaction.channelId)) {
		interaction.editReply(locales.wrongChannel);
		return;
	}
	const number = await client.ticket.get(interaction.channelId);
	const data = await client.db.table(`tt_${number}`).get('info');
	if (interaction.guildId !== null) {
		const st = await client.ticket.get('closing');
		if (!st) {
			await client.ticket.set('closing', []);
		}
		else if (st.includes(number)) {
			interaction.editReply(locales.ticketAlreadyClosing);
			return;
		}
		await client.ticket.push('closing', number);
		const guild = await client.guilds.fetch(interaction.guildId);
		const channel = await guild.channels.fetch(interaction.channelId);
		const author = await client.users.fetch(data.creatorId);
		const gData = await client.db.get(guild.id);
		const logChannel = await client.channels.fetch(gData.logChannel);
		const archive = await client.channels.fetch(gData.transcriptChannel);

		const attachment = await discordTranscripts.createTranscript(channel, {
			limit: -1,
			returnType: 'attachment',
			filename: `${author.username}.htm`,
			saveImages: true,
			footerText: 'Made by mytic2330',
			poweredBy: false,
		});

		const deleteButton = new ButtonBuilder()
			.setCustomId('delete')
			.setLabel(locales.deleteButton.lable)
			.setEmoji(locales.deleteButton.emoji)
			.setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder()
			.addComponents(deleteButton);
		const closeEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle(locales.closeEmbed.title)
			.addFields({ name: ' ', value: locales.closeEmbed.field.value }, { name: 'Ticket ID', value: `${number}`, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeEmbed.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
		const closeLog = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle((locales.closeLog.title).replace('CHANNELNAME', author.username))
			.addFields({ name: ' ', value: locales.closeLog.field.value }, { name: 'Ticket ID', value: `${number}`, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeLog.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
		const closeDmEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle(locales.closeDM.title)
			.setDescription(locales.closeDM.description)
			.setTimestamp();


		const creatorClose = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle(locales.creatorClose.title)
			.addFields({ name: ' ', value: locales.creatorClose.field.value, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.creatorClose.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
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
		const openNewTicket = new ButtonBuilder()
			.setCustomId('openNewTicketButton')
			.setLabel(locales.newTicketButton.lable)
			.setStyle(ButtonStyle.Primary);
		const openNewTicketRemoved = new ButtonBuilder()
			.setCustomId('openNewTicketButtonRemoved')
			.setLabel(locales.newTicketButtonRemoved.lable)
			.setStyle(ButtonStyle.Primary);
		const openRowRemoved = new ActionRowBuilder()
			.addComponents(openNewTicketRemoved);
		const creatorRow = new ActionRowBuilder()
			.addComponents(rate5)
			.addComponents(rate4)
			.addComponents(rate3)
			.addComponents(rate2)
			.addComponents(rate1);
		const openRow = new ActionRowBuilder()
			.addComponents(openNewTicket);

		const wbh = await client.wbh(logChannel);
		const wbhChannel = await client.wbh(channel);
		const wbhArchive = await client.wbh(archive);

		try {
			const message = await wbhArchive.send({ files: [attachment] });
			const obj = message.attachments.values().next().value;
			closeLog.addFields({ name: locales.transcriptField.name, value: (locales.transcriptField.value).replace('LINK', obj.url), inline: true });
			closeEmbed.addFields({ name: locales.transcriptField.name, value: (locales.transcriptField.value).replace('LINK', obj.url), inline: true });
			wbh.send({ embeds: [closeLog] });
			wbhChannel.send({ embeds: [closeEmbed], components: [row] });
			dbUpdate(number, data, client);
		}
		catch (e) {
			console.log(e);
		}
		for (const id of data.dmChannel) {
			const dm = await client.channels.fetch(id);
			if (dm.recipientId === data.creatorId) {
				await dm.send({ embeds: [creatorClose], components: [creatorRow, openRow] });
			}
			else {
				await dm.send({ embeds: [closeDmEmbed], components: [openRowRemoved] });
			}
		}
		interaction.editReply('Ticket closed!');
	}
}


async function dbUpdate(number, data, client) {
	for (const id of data.dmChannel) {
		await client.ticket.delete(id);
	}
	await client.ticket.delete(data.guildChannel);
	await client.db.table(`tt_${number}`).set('info.closed', true);
	await client.ticket.pull('closing', number);
}