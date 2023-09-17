module.exports = { close };
const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function close(interaction) {
	const client = interaction.client;
	const locales = client.locales.utils.closejs;
	const data = await client.ticket.get(interaction.channelId);
	await interaction.deferReply({ ephemeral: true });

	if (interaction.guildId !== null) {
		if (!await client.ticket.has(interaction.channelId)) {
			interaction.editReply(locales.wrongChannel);
			return;
		}
		if (await client.ticket.has(interaction.channelId + data.channel)) {
			interaction.editReply(locales.ticketAlreadyClosing);
			return;
		}

		const guild = await client.guilds.fetch(interaction.guildId);
		const channel = await guild.channels.fetch(interaction.channelId);
		const dm = await client.channels.fetch(data.channel);
		const author = await client.users.fetch(data.author);
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
			.addFields({ name: ' ', value: locales.closeEmbed.field.value, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeEmbed.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
		const closeLog = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle((locales.closeLog.title).replace('CHANNELNAME', author.username))
			.addFields({ name: ' ', value: locales.closeLog.field.value, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeLog.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
		const closeDmEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle(locales.closeDM.title)
			.setDescription(locales.closeDM.description)
			.setTimestamp();

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
			dbUpdate(interaction, data, client);
		}
		catch (e) {
			console.log(e);
		}
		await dm.send({ embeds: [closeDmEmbed] });
		interaction.editReply('Ticket closed!');
	}
	if (interaction.guildId == null) {
		if (data.author !== interaction.user.id) {
			interaction.editReply('You cannot close the ticket!');
			return;
		}
		if (!await client.ticket.has(interaction.channelId)) {
			interaction.editReply(locales.wrongChannel);
			return;
		}
		if (await client.ticket.has(interaction.channelId + data.channel)) {
			interaction.editReply(locales.ticketAlreadyClosing);
			return;
		}
		await client.ticket.set(interaction.channelId + data.channel, true);
		const guild = await client.guilds.fetch(data.guild);
		const dm = await client.channels.fetch(interaction.channelId);
		const channel = await guild.channels.fetch(data.channel);
		const author = await client.users.fetch(data.author);
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
			.addFields({ name: ' ', value: locales.closeEmbed.field.value, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeEmbed.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
		const closeLog = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle((locales.closeLog.title).replace('CHANNELNAME', author.username))
			.addFields({ name: ' ', value: locales.closeLog.field.value, inline: true })
			.setTimestamp()
			.setFooter({ text: (locales.closeLog.footer.text).replace('USERNAME', interaction.user.username).replace('ID', interaction.user.id) });
		const closeDmEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle(locales.closeDM.title)
			.setDescription(locales.closeDM.description)
			.setTimestamp();

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
			dbUpdate(interaction, data, client);
		}
		catch (e) {
			console.log(e);
		}
		await dm.send({ embeds: [closeDmEmbed] });
		interaction.editReply('Ticket closed!');
	}
}


async function dbUpdate(interaction, data, client) {
	for (const id of data.channel) {
		await client.ticket.delete(id);
	}
	await client.ticket.delete(data.server);
	await client.ticket.delete(interaction.channelId);
}