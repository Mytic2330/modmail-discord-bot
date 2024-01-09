import { Events, EmbedBuilder, Client } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		if (client) {
console.log(`   \x1b[36m     
██████╗░░█████╗░████████╗░░██████╗░███████╗░█████╗░██████╗░██╗░░░██╗
██╔══██╗██╔══██╗╚══██╔══╝░░██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗░██╔╝
██████╦╝██║░░██║░░░██║░░░░░██████╔╝█████╗░░███████║██║░░██║░╚████╔╝░
██╔══██╗██║░░██║░░░██║░░░░░██╔══██╗██╔══╝░░██╔══██║██║░░██║░░╚██╔╝░░
██████╦╝╚█████╔╝░░░██║░░░░░██║░░██║███████╗██║░░██║██████╔╝░░░██║░░░
╚═════╝░░╚════╝░░░░╚═╝░░░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░░░░╚═╝░░░

Logged in as ${client?.user?.tag}\x1b[0m`);
						// readyMessage(client);
						const colorSettings = lib.settings.colors;
						await lib.db.set('color', {
							'default': colorSettings.default,
							'recive': colorSettings.recive,
							'close': colorSettings.close,
							'open': colorSettings.open,
							'delete': colorSettings.delete,
							'error': colorSettings.error,
							'info': colorSettings.info,
						});
						await lib.db.set('screenshareRole', lib.settings.screenshareRole);
						await lib.db.set('screenshareChannels', lib.settings.screenshareChannels);
						if (lib.settings.vactarCommunityID.length > 1) {
							await lib.db.set('vactarCommunityID', lib.settings.vactarCommunityID);
						}
						await lib.db.set('guildId', lib.settings.guildId);
						await lib.db.set('botID', client?.user?.id);
						await lib.db.set('ApplicationID', client?.application?.id);
						await lib.db.set('ApplicationID', client?.application?.id);
						if (!await lib.db.has('ticketNumber')) {
							await lib.db.set('ticketNumber', 1);
						}
						if (!await lib.db.has('uWsr')) {
							await lib.db.set('uWsr', []);
						}
		}
	},
};

async function readyMessage(client: Client) {
	const data = await lib.db.get(lib.settings.guildId);
	if (data) {
		const idOfLog: any = await client.channels.fetch(data.logChannel)
		const idOfTranscript: any = await client.channels.fetch(data.transcriptChannel)
		
		const wbh1 = await lib.wbh(idOfLog);
		const wbh2 = await lib.wbh(idOfTranscript);

		const embed = new EmbedBuilder()
			.setColor('Aqua')
			.setTitle('Program zagnan')
			.setDescription(`Program se je uspešno zagnal.\n **Ustvarjalec:** mytic2330\n**Verzija:** ${lib.version}`);

		try {
			await wbh1?.send({ embeds: [embed] });
			await wbh2?.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	}
}