/* eslint-disable @typescript-eslint/no-explicit-any */
import { DMChannel, Events, TextChannel, Typing } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.TypingStart,
	async execute(typingRefrence: Typing) {
		// BASE DEFINITIONS //
		const client = typingRefrence.client;
		const channelId = typingRefrence.channel.id;
		const user = typingRefrence.user;

		// RETURNS IF IT IS A BOT //
		if (user.bot) return;

		// CHECKS IF CHANNEL IS A TICKET //
		const cache = lib.cache.openTickets;
		let cacheCheckHasTicket: boolean = false;
		let cacheCheckTicketNumber: number | undefined | null = undefined;
		if (cache) {
			if (cache.has(channelId)) {
				cacheCheckHasTicket = true;
				cacheCheckTicketNumber = cache.get(channelId)?.number;
			}
		}
		if (!cacheCheckHasTicket) {
			const status = await lib.ticket.has(channelId);
			if (!status) return;
			cacheCheckTicketNumber = await lib.ticket.get(channelId);
		}

		// MORE DEFINITIONS //
		const data = await lib.db
			.table(`tt_${cacheCheckTicketNumber}`)
			.get('info');

		// TRIGGER IN DM //
		if (typingRefrence.channel.isDMBased()) {
			// GET GUILD //
			const guildChannel = await client.channels.fetch(data.guildChannel);
			if (guildChannel && guildChannel instanceof TextChannel) {
				guildChannel.sendTyping();
			}
			// OTHER DM CHANNELS //
			for (const chanId of data.dmChannel) {
				try {
					if (chanId == typingRefrence.channel.id) continue;
					const chan = await client.channels.fetch(chanId);
					if (chan && chan instanceof DMChannel) {
						chan.sendTyping();
					}
				} catch (e) {
					console.log(e);
				}
			}
		}
		// TRIGGER IN GUILD //
		else {
			for (const chanId of data.dmChannel) {
				try {
					if (chanId == typingRefrence.channel.id) continue;
					const chan = await client.channels.fetch(chanId);
					if (chan && chan instanceof DMChannel) {
						chan.sendTyping();
					}
				} catch (e) {
					console.log(e);
				}
			}
		}
	},
};
