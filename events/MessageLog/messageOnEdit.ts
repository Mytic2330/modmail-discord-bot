import {
	Events,
	EmbedBuilder,
	Message,
	Client,
	DMChannel,
	TextChannel
} from 'discord.js';
import { QuickDB } from 'quick.db';
import lib from '../../bridge/bridge';

module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage: Message, newMessage: Message) {
		const client = newMessage.client;

		// CHECK IF IT IS ADMIN ONLY MESSAGE //
		// Ignore messages that start with '!adm' in guilds
		if (newMessage.guildId) {
			if (newMessage.content.toLowerCase().startsWith('!adm')) {
				return;
			}
		}

		// CHECK FOR BOT MESSAGE //
		// Ignore messages from bots
		try {
			if (oldMessage.author.bot || newMessage.author.bot) return;
		} catch (e) {
			console.log();
		}

		// Fetch ticket number from cache or database
		const cache = lib.cache.openTickets;
		const tcNum = cache.get(newMessage.channelId);
		const num: number = tcNum
			? tcNum.number
			: (await lib.ticket.get(newMessage.channelId)) || 0;

		try {
			if (!num) return;
			const table = lib.db.table(`tt_${num}`);
			const hasMessage = await table.has(newMessage.id);

			// Handle message update based on whether it exists in the database
			switch (hasMessage) {
				case true:
					handleHasMessage(client, newMessage, oldMessage, table);
					break;
				case false:
					handleNoMessage(newMessage);
					break;
			}
		} catch (e) {
			console.error(e);
			return;
		}
	}
};

// Function to handle message update if it exists in the database
async function handleHasMessage(
	client: Client,
	message: Message,
	oldMessage: Message,
	table: QuickDB
) {
	const dataMessage = await table.get(message.id);
	const arr = [];
	for (const obj of dataMessage.recive) {
		const resolvingChannel = await client.channels.fetch(obj.channelId);
		const channel = resolvingChannel as DMChannel | TextChannel;
		const msg = await channel.messages.fetch(obj.messageId);
		const embed = await createEmbedToSend(client, message);
		if (msg.guildId) {
			embed.addFields({
				name: 'Before:',
				value: oldMessage.content || 'Prazno'
			});
		}
		try {
			await msg.edit({ embeds: [embed] });
		} catch (e) {
			console.error(e);
			arr.push(obj.channelId);
		}
	}

	// Notify if message update failed in some channels
	if (arr.length != 0) {
		const string = arr.join('\n');
		message.reply({
			content:
				'Ni bilo mogoče spremeniti sporočila v naslednjih kanalih:\n' +
				string
		});
	} else {
		const embed = await createEditedEmbed(client, message);
		const passedChannel = await client.channels.fetch(message.channelId);
		const channel = passedChannel as TextChannel | DMChannel;
		channel.send({ embeds: [embed] });
	}
}

// Function to handle message update if it does not exist in the database
async function handleNoMessage(message: Message) {
	await message.reply({
		content: 'Ni mogoče poslati spremenjenega sporočila'
	});
}

// Function to create an embed for the updated message
async function createEmbedToSend(
	client: Client,
	message: Message
): Promise<EmbedBuilder> {
	const user = await client.users.fetch(message.author.id);
	const reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await lib.db.get('color.recive'))
		.setTitle('Novo sporočilo')
		.setTimestamp()
		.setFooter({
			text: `${'Ekipa BCRP'}`,
			iconURL:
				'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png'
		});

	if (message.content) {
		reciveChannelEmbed.setDescription(message.content);
	}
	if (message.attachments) {
		let num = 1;
		message.attachments.forEach((keys: any) => {
			reciveChannelEmbed.addFields({
				name: `Priponka ${num}`,
				value: `[**LINK**](${keys.attachment})`
			});
			num++;
		});
	}

	return reciveChannelEmbed;
}

// Function to create an embed indicating successful message update
async function createEditedEmbed(
	client: Client,
	message: Message
): Promise<EmbedBuilder> {
	const reciveChannelEmbed = new EmbedBuilder()
		.setColor(await lib.db.get('color.info'))
		.setTitle('Uspešno urejeno sporočilo')
		.setFooter({ text: `Message ID: ${message.id.toString()}` });

	return reciveChannelEmbed;
}
