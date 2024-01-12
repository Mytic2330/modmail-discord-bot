import {
	SlashCommandBuilder,
	EmbedBuilder,
	CommandInteraction,
	Client,
	TextChannel,
	DMChannel,
} from 'discord.js';
import { QuickDB } from 'quick.db';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('inactive')
		.setDMPermission(false)
		.setDescription('Oznaci kot inaktiven ticket'),
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		// const locales = client.locales.utils.closejs;
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
			await lib.ticket.push('inaQueue', number);
		}
		else {
			const que_chc2 = await lib.ticket.get('inaQueue');
			if (que_chc2.includes(number)) {
				interaction.editReply('Ticket je že označen kot neaktiven');
				return;
			}
			else {
				await lib.ticket.push('inaQueue', number);
			}
		}
		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle('Oznaka inaktivnosti')
			.setDescription(
				'Vaš ticket je bil označen kot neaktiven to pomeni, \nda mora biti v vašem ticketu poslano sporočilo vsakih \n48 ur drugače se bo ticket avtomatsko zaprl.\n24 ur pred zaprtjem boste opozorjeni.',
			);

		const emb = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle('Oznaka inaktivnosti')
			.setDescription(
				'Ticket je bil označen kot neaktiven to pomeni, \nda se bo ticket avtomatsko zaprl, če v 48ih urah ni sporočil.\n24 ur pred zaprtjem boste opozorjeni.',
			);

		const channels = data.dmChannel;
		const passedChannel = await client.channels.fetch(data.guildChannel);
		const channel = passedChannel as TextChannel;
		sendEmbeds(client, channels, embed);
		sendToServer(client, channel, emb);
		setData(database);
		interaction.editReply('Ticket označen kot neaktiven');
	},
};

async function sendEmbeds(
	client: Client,
	channels: Array<any>,
	embed: EmbedBuilder,
) {
	for (const id of channels) {
		try {
			const passedChannel = await client.channels.fetch(id);
			const channel = passedChannel as TextChannel | DMChannel;
			await channel.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	}
}

async function sendToServer(
	client: Client,
	channel: TextChannel | null,
	emb: EmbedBuilder,
) {
	if (channel) {
		const wbh = await lib.wbh(channel);
		wbh?.send({ embeds: [emb] });
	}
}

async function setData(database: QuickDB) {
	const now = new Date();
	const currentSec = now.getSeconds();
	const currentMs = now.getMilliseconds();
	const rej = currentSec * 1000 + currentMs;
	const remainingMilliseconds = 60000 - rej + 86400000;

	database.set('inaData', remainingMilliseconds);
}
