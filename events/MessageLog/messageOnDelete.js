const { Events } = require('discord.js');
module.exports = {
	name: Events.MessageDelete,
	async execute(message) {
		console.log(message);
		const client = message.client;
		// if (message.author.bot === true) return;
		if (!await client.ticket.has(message.channelId)) return;
		const num = await client.ticket.get(message.channelId);
		const table = await client.db.table(`tt_${num}`);

		const hasMessage = await table.has(message.id);

		switch (hasMessage) {
		case true:
			handleHasMessage(client, message, table);
			break;
		case false:
			return;
		}
	},
};

async function handleHasMessage(client, message, table) {
	const dataMessage = await table.get(message.id);
	for (const obj of dataMessage.recive) {
		const channel = await client.channels.fetch(obj.channelId);
		const msg = await channel.messages.fetch(obj.messageId);
		await msg.delete();
	}
}