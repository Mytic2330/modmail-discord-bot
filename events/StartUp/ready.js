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
		readyMessage(client);
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
		if (!await client.db.has('ticketNumber')) {
			await client.db.set('ticketNumber', 1);
		}
	},
};

async function readyMessage(client) {
	const data = await client.db.get(client.settings.guildId);
	if (data) {
		console.log(data);
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
			console.log(e);
		}
	}
}