import { Events, Client, EmbedBuilder, ChannelType } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		checkAllOpendTickets(client);
		function waitForNextMinute(callback: any) {
			const now = new Date();
			const currentSec = now.getSeconds();
			const currentMs = now.getMilliseconds();
			const rej = currentSec * 1000 + currentMs;
			const remainingMilliseconds = 60000 - rej;
			setTimeout(callback, remainingMilliseconds);
		}
		let x = 0;
		waitForNextMinute(() => {
			checkAllOpendTickets(client);
			if (x >= 172800) {console.info('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');}
			x = x + 1;
			setInterval(() => {
				checkAllOpendTickets(client);
				if (x >= 172800) {console.info('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');}
				x = x + 1;
			}, 60000);
		});
	},
};

async function checkAllOpendTickets(client: Client) {
	const opendTickets = await lib.ticket.get('openTickets');
	if (!opendTickets) return;
	for (const ticNum of opendTickets) {
		const data: { lastServerMessage:number, lastDMMessage: number } | null = await lib.db.table(`tt_${ticNum}`).get('activity');
		if (data) {
			console.log(data);
			if (!data.lastDMMessage && !data.lastServerMessage) {
				return;
			}
			if (!data.lastDMMessage) {
				const lastServerUnix: number = data.lastServerMessage;
				const currentTime = lib.unixTimestamp();
				const ServerDifference = currentTime - lastServerUnix;
				if (ServerDifference >= 86400000) {
					await lib.db.table(`tt_${ticNum}`).set('activity', { 'lastServerMessage':null, 'lastDMMessage': null });
					sendWarnings(ticNum, client);
					return;
				}
			}
			if (!data.lastServerMessage) {
				const lastDMUnix: number = data.lastDMMessage;
				const currentTime = lib.unixTimestamp();
				const ServerDifference = currentTime - lastDMUnix;
				if (ServerDifference >= 86400000) {
					await lib.db.table(`tt_${ticNum}`).set('activity', { 'lastServerMessage':null, 'lastDMMessage': null });
					sendWarnings(ticNum, client);
					return;
				}
			}
			const lastServerUnix: number = data.lastServerMessage;
			const lastDMUnix: number = data.lastDMMessage;
			const currentTime = lib.unixTimestamp();
			const ServerDifference1 = currentTime - lastServerUnix;
			const ServerDifference2 = currentTime - lastDMUnix;
			if (ServerDifference1 >= 86400000 && ServerDifference2 >= 86400000) {
				await lib.db.table(`tt_${ticNum}`).set('activity', { 'lastServerMessage':null, 'lastDMMessage': null });
				sendWarnings(ticNum, client);
			}
		}
	}
}

async function sendWarnings(num: number, client: Client) {
	const info = await lib.db.table(`tt_${num}`).get('info');
	if (!info) return;
	const roles = lib.settings.allowedRoles;
	const array = [];
	for (const role of roles) {
		array.push(`<@&${role}>`);
	}
	const string = array.join('');

	const embed = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle('Nekativen ticket!')
		.setDescription('Ta ticket v zadnjih 24 urah nima nobenega sporočila!');

	const guildChannel = await client.channels.fetch(info.guildChannel);
	if (guildChannel && guildChannel.type === ChannelType.GuildText) {
		guildChannel.send({ embeds: [embed], content: string });
	}
}
