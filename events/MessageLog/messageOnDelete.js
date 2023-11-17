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
		// DM EDIT
		if (obj.guildId == null) {
			const msg = await channel.messages.fetch(obj.messageId);
			await msg.delete();
		}
		// SERVER EDIT
		if (obj.guildId !== null) {
			const wbh = await client.wbh(channel);
			const msg = await wbh.fetchMessage(obj.messageId);
			await wbh.deleteMessage(msg);
		}
	}
}