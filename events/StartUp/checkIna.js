const { Events, EmbedBuilder } = require('discord.js');
const { close } = require('../../utils/close');
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		inaCheck(client);
		function waitForNextMinute(callback) {
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

async function inaCheck(client) {
	const queue = await client.ticket.get('inaQueue');
	if (!queue) return;
	for (const id of queue) {
		const ticket = await client.db.table(`tt_${id}`);
		const data = await ticket.get('info');
		if (data.closed === true) continue;
		const currentTime = await ticket.get('inaData');
		if (currentTime <= 0) {
			close(client, 'ina', id);
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

async function sendInaWarning(data, client) {
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

async function sendEmbeds(client, channels, embed) {
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

async function sendToServer(client, channel, emb) {
	const wbh = await client.wbh(channel);
	wbh.send({ embeds: [emb] });
}