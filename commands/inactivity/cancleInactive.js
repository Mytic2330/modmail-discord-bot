const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('cinactive')
		.setDMPermission(false)
		.setDescription('Odstrani oznako neaktivnosti'),
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
			interaction.editReply('Ticket nima oznake neaktivnosti');
		}
		else {
			const que_chc2 = await client.ticket.get('inaQueue');
			if (que_chc2.includes(number)) {
				await client.ticket.pull('inaQueue', number);
			}
			else {
				interaction.editReply('Ticket nima oznake neaktivnosti');
				return;
			}
		}
		const embed = new EmbedBuilder()
			.setColor(await client.db.get('color'))
			.setTitle('Oznaka neaktivnosti odstranjena')
			.setDescription('Ticket je bil označen kot aktiven to pomeni, \nda se ticket **ne** bo avtomatsko zaprl, če v 48ih urah ni sporočil.');

		const emb = new EmbedBuilder()
			.setColor(await client.db.get('color'))
			.setTitle('Oznaka neaktivnosti odstranjena')
			.setDescription('Ticket je bil označen kot aktiven to pomeni, \nda se ticket **ne** bo avtomatsko zaprl, če v 48ih urah ni sporočil.');

		const channels = data.dmChannel;
		const channel = await client.channels.fetch(data.guildChannel);
		sendEmbeds(client, channels, embed);
		sendToServer(client, channel, emb);
		setData(database);
		interaction.editReply('Ticket označen kot aktiven');
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
	database.delete('inaData');
}