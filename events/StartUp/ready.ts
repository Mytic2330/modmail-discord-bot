import {
	Events,
	EmbedBuilder,
	Client,
	Channel,
	TextChannel,
	BaseGuildTextChannel,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder
} from 'discord.js';
import lib from '../../bridge/bridge';
import startServer from '../../api/main';
import startWebServer from '../../web';

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		// Start API and web server if settings are enabled
		if (lib.settings.useAPI) {
			startServer();
		}
		if (lib.settings.useWebServerForTickets) {
			startWebServer();
		}

		// Initialize the database
		await lib.db.init();

		// Perform various setup tasks if the client is available
		if (client) {
			openTicketMessage(client);
			readyMessage(client);

			// Set color settings in the database
			const colorSettings = lib.settings.colors;
			await lib.db.set('color', {
				default: colorSettings.default,
				recive: colorSettings.recive,
				close: colorSettings.close,
				open: colorSettings.open,
				delete: colorSettings.delete,
				error: colorSettings.error,
				info: colorSettings.info
			});

			// Set various other settings in the database
			if (lib.settings.vactarCommunityID.length > 1) {
				await lib.db.set('vactarCommunityID', lib.settings.vactarCommunityID);
			}
			await lib.db.set('guildId', lib.settings.guildId);
			await lib.db.set('botID', client.user?.id);
			await lib.db.set('ApplicationID', client.application?.id);

			// Initialize ticket number and user whitelist if not already set
			if (!(await lib.db.has('ticketNumber'))) {
				await lib.db.set('ticketNumber', 1);
			}
			if (!(await lib.db.has('uWsr'))) {
				await lib.db.set('uWsr', []);
			}

			// Set rank settings in the database
			if (lib.settings.enableRanks) {
				await lib.db.set('enableRanks', true);
				await lib.db.set('ranks', lib.settings.ranks);
			} else {
				lib.db.delete('ranks');
				lib.db.set('enableRanks', false);
			}

			// Initialize ticket blacklist if not already set
			if (!(await lib.ticket.has('blacklist'))) {
				await lib.ticket.set('blacklist', []);
			}
		}

		// Log a message indicating the bot is ready
		console.log(`   \x1b[36m     
██████╗░░█████╗░████████╗░░██████╗░███████╗░█████╗░██████╗░██╗░░░██╗
██╔══██╗██╔══██╗╚══██╔══╝░░██╔══██╗██╔════╝██╔══██╗██╔══██╗╚██╗░██╔╝
██████╦╝██║░░██║░░░██║░░░░░██████╔╝█████╗░░███████║██║░░██║░╚████╔╝░
██╔══██╗██║░░██║░░░██║░░░░░██╔══██╗██╔══╝░░██╔══██║██║░░██║░░╚██╔╝░░
██████╦╝╚█████╔╝░░░██║░░░░░██║░░██║███████╗██║░░██║██████╔╝░░░██║░░░
╚═════╝░░╚════╝░░░░╚═╝░░░░░╚═╝░░╚═╝╚══════╝╚═╝░░╚═╝╚═════╝░░░░╚═╝░░░
			
		Logged in as ${client?.user?.tag}\x1b[0m`);
	}
};

// Function to send a ready message to log and transcript channels
async function readyMessage(client: Client) {
	const data = await lib.db.get(lib.settings.guildId);
	if (data) {
		const logChan: Channel | null = await client.channels.fetch(data.logChannel);
		const transChan: Channel | null = await client.channels.fetch(data.transcriptChannel);

		const idOfLog = logChan as TextChannel;
		const idOfTranscript = transChan as TextChannel;
		const wbh1 = await lib.wbh(idOfLog);
		const wbh2 = await lib.wbh(idOfTranscript);

		const embed = new EmbedBuilder()
			.setColor('Aqua')
			.setTitle('Program zagnan')
			.setDescription(
				`Program se je uspešno zagnal.\n **Ustvarjalec:** mytic2330\n**Verzija:** ${lib.version}`
			);

		try {
			await wbh1?.send({ embeds: [embed] });
			await wbh2?.send({ embeds: [embed] });
		} catch (e) {
			console.error(e);
		}
	}
}

// Function to handle the open ticket message
async function openTicketMessage(client: Client) {
	const databaseRecived: { messageID: string; channelID: string } | null =
		await lib.db.get('openMessage');
	const channelidRecived: string | undefined =
		lib.settings.openTicketMessageChannel;
	if (databaseRecived) {
		if (databaseRecived.channelID && databaseRecived.messageID == null) {
			if (channelidRecived) {
				sendEmbed(client, channelidRecived);
			}
			return;
		}
		const channel = await client.channels.fetch(databaseRecived.channelID);
		if (channel instanceof BaseGuildTextChannel) {
			try {
				const msg = await channel.messages.fetch(databaseRecived.messageID);
				msg.delete();
			} catch (e) {
				console.error(e);
			}
			if (channelidRecived) {
				sendEmbed(client, channelidRecived);
			}
		}
	} else if (channelidRecived) {
		sendEmbed(client, channelidRecived);
	}
}

// Function to send an embed message to the specified channel
async function sendEmbed(client: Client, channelidRecived: string) {
	try {
		const channel = await client.channels.fetch(channelidRecived);
		if (channel instanceof BaseGuildTextChannel) {
			const embed = new EmbedBuilder()
				.setAuthor({ name: 'BCRP Ticket' })
				.setColor('Aqua')
				.setFields(
					{
						name: '1. Odprti DM',
						value: 'Da lahko začneš pogovor z našo ekipo,\nmoraš imeti odprete DMe za ta server.'
					},
					{
						name: '2. Nimaš blokiranega bota',
						value: 'Mene, od katerega bereš sporočilo, ne smeš imeti blokirangea.'
					},
					{
						name: '3. Nisi blacklistan',
						value: 'Upam, da se nisi zameril komu od staffov. Namreč, lahko so te blacklistali...'
					}
				)
				.setDescription(
					'Pozdravljen! \n Malo bolj nenavaden način odpiranja ticketa...\n Tukaj lahko pritisneš spodnji gumb, da začneš pogovor z našo ekipo.\n Moraš pa izpolnjevati naslednje pogoje:'
				);
			const button = new ButtonBuilder()
				.setCustomId('openTicketInGuild')
				.setLabel('Začni pogovor')
				.setStyle(ButtonStyle.Success);
			const row: any = new ActionRowBuilder().addComponents(button);
			try {
				const message = await channel.send({
					embeds: [embed],
					components: [row]
				});
				await lib.db.set('openMessage', {
					messageID: message.id,
					channelID: message.channelId
				});
			} catch (e) {
				console.error(e);
			}
		} else {
			console.log('The channel is not a guild text channel');
		}
	} catch (e) {
		console.error(e);
	}
}
