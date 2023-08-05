module.exports = { close };
const discordTranscripts = require('discord-html-transcripts');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function close(interaction) {
	await interaction.deferReply({ ephemeral: true });
	const client = interaction.client;
	if (interaction.guildId !== null) {
		if (!await client.ticket.has(interaction.channelId)) {
			interaction.editReply('Napačen kanal. Prosimo uporabite to v ticket kanalu!');
			return;
		}
		const data = await client.ticket.get(interaction.channelId);
		const guild = await client.guilds.fetch(interaction.guildId);
		const channel = await guild.channels.fetch(interaction.channelId);
		const dm = await client.channels.fetch(data.channel);
		const author = await client.users.fetch(data.author);
		const log = await client.db.get(guild.id);
		const logChannel = await client.channels.fetch(log.logChannel);

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
			.setStyle(ButtonStyle.Danger);
		const row = new ActionRowBuilder()
			.addComponents(deleteButton);
		const closeEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket zaprt!')
			.setTimestamp();
		const closeLog = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket ' + author.username + ' zaprt!')
			.setTimestamp();
		const closeDmEmbed = new EmbedBuilder()
			.setColor(await client.db.get('close'))
			.setTitle('Ticket zaprt!')
			.setDescription('Vaš ticket je bil zaprt! Če želite odpreti nov ticket pošljite sporočilo, \nda prejmete nov menu za izbiranje kategorije.')
			.setTimestamp();

		const wbh = await client.wbh(logChannel);
		const wbhChannel = await client.wbh(channel);

		try {
			wbh.send({ embeds: [closeLog], files: [attachment] });
			wbhChannel.send({ embeds: [closeEmbed], components: [row] });
		}
		catch (e) {
			console.log(e);
		}

		await dm.send({ embeds: [closeDmEmbed] });

		await client.ticket.delete(data.channel);
		await client.ticket.delete(interaction.channelId);

		interaction.editReply('Ticket closed!');
	}
}