const { Events } = require('discord.js');
module.exports = {
	name: Events.TypingStart,
	async execute(typingRefrence) {
		const client = typingRefrence.client;
		const channelId = typingRefrence.channel.id;
		const user = typingRefrence.user;

		if (user.bot) return;

		const status = await client.ticket.has(channelId);
		if (!status) return;

		const x = await client.ticket.get(channelId);
		const data = await client.db.table(`tt_${x}`).get('info');


		if (await typingRefrence.channel.isDMBased()) {
			const guildChannel = await client.channels.fetch(data.guildChannel);
			guildChannel.sendTyping();
			for (const chanId of data.dmChannel) {
				if (chanId == typingRefrence.channel.id) continue;
				const chan = await client.channels.fetch(chanId);
				chan.sendTyping();
			}
		}
		else {
			for (const chanId of data.dmChannel) {
				if (chanId == typingRefrence.channel.id) continue;
				const chan = await client.channels.fetch(chanId);
				chan.sendTyping();
			}
		}
	},
};

// !NE DOKONCANO