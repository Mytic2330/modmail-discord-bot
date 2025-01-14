import { Client, DMChannel, Events, Message, TextChannel } from 'discord.js';
import { QuickDB } from 'quick.db';
import lib from '../../bridge/bridge';

module.exports = {
	name: Events.MessageDelete,
	async execute(message: Message) {
		const client = message.client;

		// Fetch ticket number from cache or database
		const cache = lib.cache.openTickets;
		const tcNum = cache.get(message.channelId);
		const num: number = tcNum
			? tcNum.number
			: (await lib.ticket.get(message.channelId)) || 0;

		try {
			if (!num) return;
			const table = lib.db.table(`tt_${num}`);
			const hasMessage = await table.has(message.id);

			// Handle message deletion based on whether it exists in the database
			switch (hasMessage) {
				case true:
					handleHasMessage(client, message, table);
					break;
				case false:
					return;
			}
		} catch (e) {
			console.error(e);
			return;
		}
	}
};

// Function to handle message deletion if it exists in the database
async function handleHasMessage(
	client: Client,
	message: Message,
	table: QuickDB
) {
	const dataMessage = await table.get(message.id);
	for (const obj of dataMessage.recive) {
		const passedChannel = await client.channels.fetch(obj.channelId);
		const channel = passedChannel as TextChannel | DMChannel;
		const msg = await channel.messages.fetch(obj.messageId);

		// React with ❌ if the message is in a guild, otherwise delete it
		if (Object.prototype.hasOwnProperty.call(channel, 'guildId')) {
			await msg.react('❌');
		} else {
			await msg.delete();
		}
	}
}
