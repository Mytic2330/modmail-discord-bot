import { Client, Events } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		setInterval(() => {
			sendAdmins(client);
		}, 60000);
	}
};


async function sendAdmins(client: Client) {
	const guildid = await lib.db.get('guildId');
	const guild = await client.guilds.fetch(guildid);
	const memArr: any = [];
	for (const roleID of lib.settings.allowedRoles) {
		const role = await guild.roles.fetch(roleID);
		const members = role?.members;
		if (members) {
			for (const member of members.keys()) {
				if (!memArr.includes(member)) {
					memArr.push(member);
				}
			}
		}
	}
	const data = JSON.stringify({ accessCode: '018f594e-de2f-7e68-aaca-7ff9a0005db7', admins: memArr });
	try {
		await fetch('http://localhost:4000/api/auth/admins', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: data
		});
	} catch (e) {
		console.log();
	}
}
