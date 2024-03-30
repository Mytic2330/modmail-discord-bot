import {
	SlashCommandBuilder,
	EmbedBuilder,
	CommandInteraction,
	Client,
	TextChannel,
	DMChannel
} from 'discord.js';
import { QuickDB } from 'quick.db';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('cinactive')
		.setDMPermission(false)
		.setDescription('Odstrani oznako neaktivnosti'),
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		await interaction.deferReply({ ephemeral: true });
		if (!(await lib.ticket.has(interaction.channelId))) {
			interaction.editReply('Ta kanal ni aktiven ticket');
			return;
		}
		const number = await lib.ticket.get(interaction.channelId);
		const database = lib.db.table(`tt_${number}`);
		const data = await database.get('info');
		const que_chc1 = await lib.ticket.get('inaQueue');
		if (!que_chc1) {
			await lib.ticket.set('inaQueue', []);
			interaction.editReply('Ticket nima oznake neaktivnosti');
		} else {
			const que_chc2 = await lib.ticket.get('inaQueue');
			if (que_chc2.includes(number)) {
				await lib.ticket.pull('inaQueue', number);
			} else {
				interaction.editReply('Ticket nima oznake neaktivnosti');
				return;
			}
		}
		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle('Oznaka neaktivnosti odstranjena')
			.setDescription(
				'Ticket je bil označen kot aktiven to pomeni, \nda se ticket **ne** bo avtomatsko zaprl, če v 24ih urah ni sporočil.'
			);

		const emb = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle('Oznaka neaktivnosti odstranjena')
			.setDescription(
				'Ticket je bil označen kot aktiven to pomeni, \nda se ticket **ne** bo avtomatsko zaprl, če v 24ih urah ni sporočil.'
			);

		const channels = data.dmChannel;
		const passedChannel = await client.channels.fetch(data.guildChannel);
		const channel = passedChannel as TextChannel;
		sendEmbeds(client, channels, embed);
		sendToServer(client, channel, emb);
		setData(database);
		interaction.editReply('Ticket označen kot aktiven');
	}
};

async function sendEmbeds(
	client: Client,
	channels: Array<any>,
	embed: EmbedBuilder
) {
	for (const id of channels) {
		try {
			const passedChannel = await client.channels.fetch(id);
			const channel = passedChannel as TextChannel | DMChannel;
			await channel.send({ embeds: [embed] });
		} catch (e) {
			console.error(e);
		}
	}
}

async function sendToServer(
	client: Client,
	channel: TextChannel,
	emb: EmbedBuilder
) {
	const wbh = await lib.wbh(channel);
	wbh?.send({ embeds: [emb] });
}

async function setData(database: QuickDB) {
	database.delete('inaData');
}
