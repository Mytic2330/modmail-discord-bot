import { Events, EmbedBuilder, Client, Channel, TextChannel } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		await lib.db.init();
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
				default: colorSettings.default,
				recive: colorSettings.recive,
				close: colorSettings.close,
				open: colorSettings.open,
				delete: colorSettings.delete,
				error: colorSettings.error,
				info: colorSettings.info,
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
			if (!(await lib.db.has('ticketNumber'))) {
				await lib.db.set('ticketNumber', 1);
			}
			if (!(await lib.db.has('uWsr'))) {
				await lib.db.set('uWsr', []);
			}
			if (lib.settings.enableRanks) {
				await lib.db.set('enableRanks', true);
				await lib.db.set('ranks', lib.settings.ranks);
			}
			else {
				lib.db.delete('ranks');
				lib.db.set('enableRanks', false);
			}
		}
	},
};

async function readyMessage(client: Client) {
	const data = await lib.db.get(lib.settings.guildId);
	if (data) {
		const logChan: Channel | null = await client.channels.fetch(data.logChannel);
		const transChan: Channel | null = await client.channels.fetch(
			data.transcriptChannel,
		);

		const idOfLog = logChan as TextChannel;
		const idOfTranscript = transChan as TextChannel;
		const wbh1 = await lib.wbh(idOfLog);
		const wbh2 = await lib.wbh(idOfTranscript);

		const embed = new EmbedBuilder()
			.setColor('Aqua')
			.setTitle('Program zagnan')
			.setDescription(
				`Program se je uspešno zagnal.\n **Ustvarjalec:** mytic2330\n**Verzija:** ${lib.version}`,
			);

		try {
			await wbh1?.send({ embeds: [embed] });
			await wbh2?.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	}
}
