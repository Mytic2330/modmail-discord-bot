import { Events, EmbedBuilder, Client } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		inaCheck(client);
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
			inaCheck(client);
			if (x >= 172800) {
				console.info('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');
			}
			x = x + 1;
			setInterval(() => {
				inaCheck(client);
				if (x >= 172800) {
					console.info('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');
				}
				x = x + 1;
			}, 60000);
		});
	}
};

async function inaCheck(client: Client) {
	const queue = await lib.ticket.get('inaQueue');
	if (!queue) return;
	for (const id of queue) {
		const ticket = lib.db.table(`tt_${id}`);
		const data = await ticket.get('info');
		if (data.closed === true) continue;
		const currentTime = await ticket.get('inaData');
		if (currentTime <= 0) {
			lib.close(client, 'ina', id);
			continue;
		}
		if (currentTime == 43200000) {
			sendInaWarning(data, client);
		}
		if (currentTime > 86400000) {
			await ticket.set('inaData', 86400000);
		} else if (currentTime <= 86400000) {
			const time = currentTime - 60000;
			await ticket.set('inaData', time);
		}
	}
}

async function sendInaWarning(data: any, client: Client) {
	const color = await lib.db.get('color.default');
	const embed = new EmbedBuilder()
		.setColor(color)
		.setTitle('Opozorilo o nekativnosti!')
		.setDescription(
			'Vaš ticket se bo zaprl čez 12 ur, če ne bo nobenega sporočila!'
		);

	const emb = new EmbedBuilder()
		.setColor(color)
		.setTitle('Opozorilo o nekativnosti!')
		.setDescription(
			'Ticket se bo zaprl čez 12 ur, če ne bo nobenega sporočila!'
		);

	const channel = await client.channels.fetch(data.guildChannel);
	sendToServer(channel, emb);
	sendEmbeds(client, data.dmChannel, embed);
}

async function sendEmbeds(client: Client, channels: any, embed: EmbedBuilder) {
	for (const id of channels) {
		try {
			const channel: any = await client.channels.fetch(id);
			await channel?.send({ embeds: [embed] });
		} catch (e) {
			console.error(e);
		}
	}
}

async function sendToServer(channel: any, emb: EmbedBuilder) {
	channel.send({ embeds: [emb] });
}
