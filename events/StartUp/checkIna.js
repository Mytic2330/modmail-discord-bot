const { Events } = require('discord.js');
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
			if (x >= 172800) console.log('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');
			x = x + 1;
			setInterval(() => {
				inaCheck(client);
				if (x >= 172800) console.log('\x1b[31m BOT RESTART IS ADVISED ⚠️\x1b[0m');
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
		const currentTime = await ticket.get('inaData');
		if (currentTime > 86400000) {
			await ticket.set('inaData', 86400000);
		}
		else if (currentTime <= 86400000) {
			const time = currentTime - 60000;
			await ticket.set('inaData', time);
		}
	}
}