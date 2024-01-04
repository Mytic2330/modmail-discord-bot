const { Events, EmbedBuilder } = require('discord.js');
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
		// readyMessage(client);
		const colorSettings = client.settings.colors;
		await client.db.set('color', { 'default': colorSettings.default,
			'recive': colorSettings.recive,
			'close': colorSettings.close,
			'open': colorSettings.open,
			'delete': colorSettings.delete,
			'error': colorSettings.error,
		});
		await client.db.set('screenshareRole', client.settings.screenshareRole);
		await client.db.set('screenshareChannels', client.settings.screenshareChannels);
		if (client.settings.vactarCommunityID.length > 1) {
			await client.db.set('vactarCommunityID', client.settings.vactarCommunityID);
		}
		await client.db.set('guildId', client.settings.guildId);
		await client.db.set('botID', client.user.id);
		await client.db.set('ApplicationID', client.application.id);
		await client.db.set('ApplicationID', client.application.id);
		if (!await client.db.has('ticketNumber')) {
			await client.db.set('ticketNumber', 1);
		}
		if (!await client.db.has('uWsr')) {
			await client.db.set('uWsr', []);
		}
	},
};

async function readyMessage(client) {
	const data = await client.db.get(client.settings.guildId);
	if (data) {
		const wbh1 = await client.wbh(await client.channels.fetch(data.logChannel));
		const wbh2 = await client.wbh(await client.channels.fetch(data.transcriptChannel));

		const embed = new EmbedBuilder()
			.setColor('Aqua')
			.setTitle('Program zagnan')
			.setDescription(`Program se je uspešno zagnal.\n **Ustvarjalec:** mytic2330\n**Verzija:** ${client.version}`);

		try {
			await wbh1.send({ embeds: [embed] });
			await wbh2.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	}
}