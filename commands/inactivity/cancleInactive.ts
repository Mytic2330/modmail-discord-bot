/* eslint-disable no-inline-comments */
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
		.setDescription('Odstrani oznako neaktivnosti'), // Sets up the slash command
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		await interaction.deferReply({ ephemeral: true }); // Defers the reply to the interaction
		if (!(await lib.ticket.has(interaction.channelId))) {
			interaction.editReply('Ta kanal ni aktiven ticket'); // Checks if the channel is an active ticket
			return;
		}
		const number = await lib.ticket.get(interaction.channelId);
		const database = lib.db.table(`tt_${number}`);
		const data = await database.get('info');
		const que_chc1 = await lib.ticket.get('inaQueue');
		if (!que_chc1) {
			await lib.ticket.set('inaQueue', []);
			interaction.editReply('Ticket nima oznake neaktivnosti'); // Checks if the ticket has an inactivity mark
		} else {
			const que_chc2 = await lib.ticket.get('inaQueue');
			if (que_chc2.includes(number)) {
				await lib.ticket.pull('inaQueue', number); // Removes the inactivity mark from the ticket
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
		sendEmbeds(client, channels, embed); // Sends the embed to the user
		sendToServer(client, channel, emb); // Sends the embed to the server
		setData(database); // Updates the database
		interaction.editReply('Ticket označen kot aktiven'); // Replies to the interaction
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
			await channel.send({ embeds: [embed] }); // Sends the embed to each channel
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
	wbh?.send({ embeds: [emb] }); // Sends the embed to the server
}

async function setData(database: QuickDB) {
	database.delete('inaData'); // Deletes the inactivity data from the database
}
