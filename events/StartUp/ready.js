const { Events } = require('discord.js');
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`   \x1b[36m     
██████╗░░█████╗░████████╗░░██████╗░███████╗░█████╗░██████╗░██╗░░░██╗
██╔══██╗██╔══██╗╚══██╔══╝░░██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗░██╔╝
██████╦╝██║░░██║░░░██║░░░░░██████╔╝█████╗░░███████║██║░░██║░╚████╔╝░
██╔══██╗██║░░██║░░░██║░░░░░██╔══██╗██╔══╝░░██╔══██║██║░░██║░░╚██╔╝░░
██████╦╝╚█████╔╝░░░██║░░░░░██║░░██║███████╗██║░░██║██████╔╝░░░██║░░░
╚═════╝░░╚════╝░░░░╚═╝░░░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░░░░╚═╝░░░

Logged in as ${client.user.tag}\x1b[0m`);

		await client.db.set('color', 'Aqua');
		await client.db.set('recive', 'Aqua');
		await client.db.set('send', 'DarkAqua');
		await client.db.set('close', 'Red');
		await client.db.set('open', 'Aqua');
		await client.db.set('delete', 'DarkRed');
		await client.db.set('error', 'Red');
		await client.db.set('guildId', client.settings.guildId);
		await client.db.set('botID', client.user.id);
		await client.db.set('ApplicationID', client.application.id);
	},
};