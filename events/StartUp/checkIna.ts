import { Events, EmbedBuilder } from 'discord.js';
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client:any) {
		inaCheck(client);
		function waitForNextMinute(callback:any) {
			const now = new Date();
			const currentSec = now.getSeconds();
			const currentMs = now.getMilliseconds();
			const rej = (currentSec * 1000) + currentMs;
			const remainingMilliseconds = (60000 - rej);
			setTimeout(callback, remainingMilliseconds);
		}
		let x = 0;
		waitForNextMinute(() => {
			inaCheck(client);
			if (x >= 172800) console.info('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');
			x = x + 1;
			setInterval(() => {
				inaCheck(client);
				if (x >= 172800) console.info('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');
				x = x + 1;
			}, 60000);
		});
	},
};

async function inaCheck(client:any) {
	const queue = await client.ticket.get('inaQueue');
	if (!queue) return;
	for (const id of queue) {
		const ticket = await client.db.table(`tt_${id}`);
		const data = await ticket.get('info');
		if (data.closed === true) continue;
		const currentTime = await ticket.get('inaData');
		if (currentTime <= 0) {
			const lib = client.lib;
			lib.close(client, 'ina', id);
			continue;
		}
		if (currentTime == 86400000) {
			sendInaWarning(data, client);
		}
		if (currentTime > 172800000) {
			await ticket.set('inaData', 172800000);
		}
		else if (currentTime <= 172800000) {
			const time = currentTime - 60000;
			await ticket.set('inaData', time);
		}
	}
}

async function sendInaWarning(data:any, client:any) {
	const embed = new EmbedBuilder()
		.setColor(await client.db.get('color.default'))
		.setTitle('Opozorilo o nekativnosti!')
		.setDescription('Vaš ticket se bo zaprl čez 24 ur, če ne bo nobenega sporočila!');

	const emb = new EmbedBuilder()
		.setColor(await client.db.get('color.default'))
		.setTitle('Opozorilo o nekativnosti!')
		.setDescription('Ticket se bo zaprl čez 24 ur, če ne bo nobenega sporočila!');

	const channel = await client.channels.fetch(data.guildChannel);
	sendToServer(client, channel, emb);
	sendEmbeds(client, data.dmChannel, embed);
}

async function sendEmbeds(client:any, channels:any, embed: EmbedBuilder) {
	for (const id of channels) {
		try {
			const channel = await client.channels.fetch(id);
			await channel.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	}
}

async function sendToServer(client:any, channel:any, emb: EmbedBuilder) {
	const wbh = await client.wbh(channel);
	wbh.send({ embeds: [emb] });
}