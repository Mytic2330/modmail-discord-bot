module.exports = { close };
const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function close(interaction) {
	const client = interaction.client;
	const data = await client.ticket.get(interaction.channelId);
	await interaction.deferReply({ ephemeral: true });
	if (interaction.guildId !== null) {
		if (!await client.ticket.has(interaction.channelId)) {
			interaction.editReply('Napačen kanal. Prosimo uporabite to v ticket kanalu!');
			return;
		}
		if (await client.ticket.has(interaction.channelId + data.channel)) {
			interaction.editReply('Ticket se že zapira');
			return;
		}
		await client.ticket.set(interaction.channelId + data.channel, true);
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
			.setLabel('Izbriši')
			.setEmoji('🗑️')
			.setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder()
			.addComponents(deleteButton);
		const closeEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket zaprt!')
			.addFields({ name: ' ', value: 'Ticket je bil zaprt! Ponovno odpiranje ni mogoče.', inline: true })
			.setTimestamp()
			.setFooter({ text: `Zaprl: ${interaction.user.username} | ${interaction.user.id}` });
		const closeLog = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket ' + author.username + ' zaprt!')
			.addFields({ name: ' ', value: 'Ticket je bil zaprt! Ponovno odpiranje ni mogoče.', inline: true })
			.setTimestamp()
			.setFooter({ text: `Zaprl: ${interaction.user.username} | ${interaction.user.id}` });
		const closeDmEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket zaprt!')
			.setDescription('Vaš ticket je bil zaprt! Če želite odpreti nov ticket pošljite sporočilo, \nda prejmete nov menu za izbiranje kategorije.')
			.setTimestamp();

		const wbh = await client.wbh(logChannel);
		const wbhChannel = await client.wbh(channel);
		const wbhArchive = await client.wbh(archive);

		try {
			const message = await wbhArchive.send({ files: [attachment] });
			const obj = message.attachments.values().next().value;
			console.log(obj);
			closeLog.addFields({ name: 'Transcript', value: `Pogovor si lahko ogledate [**TUKAJ**](${obj.url})`, inline: true });
			closeEmbed.addFields({ name: 'Transcript', value: `Pogovor si lahko ogledate [**TUKAJ**](${obj.url})`, inline: true });
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
		if (!await client.ticket.has(interaction.channelId)) {
			interaction.editReply('Ticket ni bil najden!');
			return;
		}
		if (await client.ticket.has(interaction.channelId + data.channel)) {
			interaction.editReply('Ticket se že zapira');
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
			.setLabel('Izbriši')
			.setEmoji('🗑️')
			.setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder()
			.addComponents(deleteButton);
		const closeEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket zaprt!')
			.addFields({ name: 'Opis', value: 'Ticket je bil zaprt! Ponovno odpiranje ni mogoče.', inline: true })
			.setTimestamp()
			.setFooter({ text: `Zaprl: ${interaction.user.username} | ${interaction.user.id}` });
		const closeLog = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket ' + author.username + ' zaprt!')
			.addFields({ name: 'Opis', value: 'Ticket je bil zaprt! Ponovno odpiranje ni mogoče.', inline: true })
			.setTimestamp()
			.setFooter({ text: `Zaprl: ${interaction.user.username} | ${interaction.user.id}` });
		const closeDmEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket zaprt!')
			.setDescription('Vaš ticket je bil zaprt! Če želite odpreti nov ticket pošljite sporočilo, \nda prejmete nov menu za izbiranje kategorije.')
			.setTimestamp();

		const wbh = await client.wbh(logChannel);
		const wbhChannel = await client.wbh(channel);
		const wbhArchive = await client.wbh(archive);

		try {
			const message = await wbhArchive.send({ files: [attachment] });
			const obj = message.attachments.values().next().value;
			closeLog.addFields({ name: 'Transcript', value: `Pogovor si lahko ogledate [**TUKAJ**](${obj.url})`, inline: true });
			closeEmbed.addFields({ name: 'Transcript', value: `Pogovor si lahko ogledate [**TUKAJ**](${obj.url})`, inline: true });
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
	await client.ticket.delete(data.channel);
	await client.ticket.delete(interaction.channelId);
	await client.ticket.delete(interaction.channelId + data.channel);
}