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
		.setName('inactive')
		.setDMPermission(false)
		.setDescription('Oznaci kot inaktiven ticket'), // Command description
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		// const locales = client.locales.utils.closejs;
		await interaction.deferReply({ ephemeral: true }); // Defer the reply to make it ephemeral
		if (!(await lib.ticket.has(interaction.channelId))) {
			interaction.editReply('Ta kanal ni aktiven ticket'); // Reply if the channel is not an active ticket
			return;
		}
		const number = await lib.ticket.get(interaction.channelId); // Get the ticket number
		const database = lib.db.table(`tt_${number}`); // Get the ticket database
		const data = await database.get('info'); // Get ticket info from the database
		const que_chc1 = await lib.ticket.get('inaQueue'); // Get the inactivity queue
		if (!que_chc1) {
			await lib.ticket.set('inaQueue', []); // Initialize the inactivity queue if it doesn't exist
			await lib.ticket.push('inaQueue', number); // Add the ticket to the inactivity queue
		} else {
			const que_chc2 = await lib.ticket.get('inaQueue');
			if (que_chc2.includes(number)) {
				interaction.editReply('Ticket je že označen kot neaktiven'); // Reply if the ticket is already marked as inactive
				return;
			} else {
				await lib.ticket.push('inaQueue', number); // Add the ticket to the inactivity queue
			}
		}
		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle('Oznaka inaktivnosti')
			.setDescription(
				'Vaš ticket je bil označen kot neaktiven to pomeni, \nda mora biti v vašem ticketu poslano sporočilo vsakih \n48 ur drugače se bo ticket avtomatsko zaprl.\n24 ur pred zaprtjem boste opozorjeni.'
			); // Create an embed for the user

		const emb = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle('Oznaka inaktivnosti')
			.setDescription(
				'Ticket je bil označen kot neaktiven to pomeni, \nda se bo ticket avtomatsko zaprl, če v 48ih urah ni sporočil.\n24 ur pred zaprtjem boste opozorjeni.'
			); // Create an embed for the server

		const channels = data.dmChannel;
		const passedChannel = await client.channels.fetch(data.guildChannel);
		const channel = passedChannel as TextChannel;
		sendEmbeds(client, channels, embed); // Send embeds to the user
		sendToServer(client, channel, emb); // Send embed to the server
		setData(database); // Set the inactivity data in the database
		interaction.editReply('Ticket označen kot neaktiven'); // Reply that the ticket is marked as inactive
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
			await channel.send({ embeds: [embed] }); // Send embed to each channel
		} catch (e) {
			console.error(e);
		}
	}
}

async function sendToServer(
	client: Client,
	channel: TextChannel | null,
	emb: EmbedBuilder
) {
	if (channel) {
		const wbh = await lib.wbh(channel);
		wbh?.send({ embeds: [emb] }); // Send embed to the server
	}
}

async function setData(database: QuickDB) {
	const now = new Date();
	const currentSec = now.getSeconds();
	const currentMs = now.getMilliseconds();
	const rej = currentSec * 1000 + currentMs;
	const remainingMilliseconds = 60000 - rej + 86400000;

	database.set('inaData', remainingMilliseconds); // Set the inactivity data in the database
}
