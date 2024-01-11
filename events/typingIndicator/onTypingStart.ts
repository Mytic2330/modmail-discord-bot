import { Events } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.TypingStart,
	async execute(typingRefrence: any) {
		const client = typingRefrence.client;
		const channelId = typingRefrence.channel.id;
		const user = typingRefrence.user;

		if (user.bot) return;

		const status = await lib.ticket.has(channelId);
		if (!status) return;

		const x = await lib.ticket.get(channelId);
		const data = await lib.db.table(`tt_${x}`).get('info');


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