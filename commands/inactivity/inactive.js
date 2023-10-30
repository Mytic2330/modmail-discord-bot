const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ina')
		.setDescription('Oznaci kot inaktiven ticket'),
	async execute(interaction) {
		const client = interaction.client;
		// const locales = client.locales.utils.closejs;
		await interaction.deferReply({ ephemeral: true });
		if (!await client.ticket.has(interaction.channelId)) {
			interaction.editReply('Ta kanal ni aktiven ticket');
			return;
		}
		const number = await client.ticket.get(interaction.channelId);
		const database = await client.db.table(`tt_${number}`);
		const data = await database.get('info');
		const que_chc1 = await client.ticket.get('inaQueue');
		if (!que_chc1) {
			await client.ticket.set('inaQueue', []);
			await client.ticket.push('inaQueue', number);
		}
		else {
			const que_chc2 = await client.ticket.get('inaQueue');
			if (que_chc2.includes(number)) {
				interaction.editReply('Ticket je že označen kot neaktiven');
				return;
			}
			else {
				await client.ticket.push('inaQueue', number);
			}
		}
		const embed = new EmbedBuilder()
			.setColor(await client.db.get('color'))
			.setTitle('Oznaka inaktivnosti')
			.setDescription('Vaš ticket je bil označen kot neaktiven to pomeni, \nda mora biti v vašem ticketu poslano sporočilo vsakih \n48 ur drugače se bo ticket avtomatsko zaprl.\n24 ur pred zaprtjem boste opozorjeni.');

		const emb = new EmbedBuilder()
			.setColor(await client.db.get('color'))
			.setTitle('Oznaka inaktivnosti')
			.setDescription('Ticket je bil označen kot neaktiven to pomeni, \nda se bo ticket avtomatsko zaprl, če v 48ih urah ni sporočil.\n24 ur pred zaprtjem boste opozorjeni.');

		const channels = data.dmChannel;
		const channel = await client.channels.fetch(data.guildChannel);
		sendEmbeds(client, channels, embed);
		sendToServer(client, channel, emb);
		setData(database);
		interaction.editReply('Ticket označen kot neaktiven');
	},
};

async function sendEmbeds(client, channels, embed) {
	for (const id of channels) {
		try {
			const channel = await client.channels.fetch(id);
			await channel.send({ embeds: [embed] });
		}
		catch (e) {
			console.log(e);
		}
	}
}

async function sendToServer(client, channel, emb) {
	const wbh = await client.wbh(channel);
	wbh.send({ embeds: [emb] });
}

async function setData(database) {
	const now = new Date();
	const currentSec = now.getSeconds();
	const currentMs = now.getMilliseconds();
	const rej = (currentSec * 1000) + currentMs;
	const remainingMilliseconds = (60000 - rej) + 172800000;

	database.set('inaData', remainingMilliseconds);
}