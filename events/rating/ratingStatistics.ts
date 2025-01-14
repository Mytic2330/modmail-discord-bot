import {
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	EmbedBuilder,
	ButtonInteraction,
	ModalSubmitInteraction,
	Client,
	DMChannel,
	Snowflake,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction
} from 'discord.js';
import lib from '../../bridge/bridge';
import ticketInfoI from '../../interfaces/ticketInfo';

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction | ModalSubmitInteraction) {
		// Handle button interactions
		if (interaction.isButton()) {
			if (!interaction.customId.startsWith('stat')) return;
			if (
				interaction.message?.interaction?.user.id !==
				interaction.user.id
			) {
				interaction.reply({ content: 'To ni tvoje!', ephemeral: true });
				return;
			}
			switchCheck(interaction);
		} else if (interaction.isModalSubmit()) {
			// Handle modal submissions
			if (interaction.customId == 'getTicketStatsModal') {
				processModal(interaction);
			}
		}
	},
	originalEmbed
};

// Function to handle different button interactions
async function switchCheck(interaction: ButtonInteraction) {
	switch (interaction.customId.split('_')[1]) {
		case 'rating':
			rateFnc(interaction);
			break;
		case 'ticket':
			ticketFnc(interaction);
			break;
		case 'goBack':
			originalEmbed(interaction);
			break;
	}
}

// Function to gather and display rating statistics
async function rateFnc(interaction: ButtonInteraction) {
	const all_tickets = await lib.ticket.get('tickets');
	const arr = [];

	for (const ticket of all_tickets) {
		const data = await gatherTicketInfo(ticket);
		if (data != null) arr.push(data);
	}
	const ratings = [];
	const messagesByServer = [];
	const messagesByDM = [];
	const creatorIds = [];

	for (const object of arr) {
		if (object.analytics.rating) {
			ratings.push(object.analytics.rating);
		}
		if (object.messageAnalitys.messages.sentByDM) {
			messagesByDM.push(object.messageAnalitys.messages.sentByDM);
		}
		if (object.messageAnalitys.messages.sentByServer) {
			messagesByServer.push(object.messageAnalitys.messages.sentByServer);
		}
		if (object.info.creatorId) {
			creatorIds.push(object.info.creatorId);
		}
	}

	const processedData = await calculateData(
		ratings,
		messagesByServer,
		messagesByDM,
		creatorIds
	);

	if (processedData) {
		const embed = new EmbedBuilder()
			.setTitle('Statistika')
			.setColor('Random')
			.addFields(
				{
					name: 'Povprečna ocena:',
					value: `${processedData.avgRating}`
				},
				{
					name: 'Povprečno sporočil od administracije:',
					value: `${processedData.avgMessSer}`
				},
				{
					name: 'Povprečno sporočil od uporabnika:',
					value: `${processedData.avgMessDM}`
				},
				{
					name: 'Uporabnik, ki je največkrat odprl ticke:',
					value: `<@${processedData.mostCreator.mostFrequent}>\nID: ${processedData.mostCreator.mostFrequent}\nKolikokrat: ${processedData.mostCreator.maxCount}`
				}
			);
		const button = new ButtonBuilder()
			.setCustomId('stat_goBack')
			.setLabel('Nazaj')
			.setStyle(ButtonStyle.Danger);
		const row: any = new ActionRowBuilder().addComponents(button);
		interaction.update({ embeds: [embed], components: [row] });
	} else {
		interaction.message.edit({ content: 'Prišlo je do napake' });
	}
}

// Function to calculate average data and find the most frequent creator
async function calculateData(
	ratings: Array<string>,
	messagesByServer: Array<number>,
	messagesByDM: Array<number>,
	creatorId: Array<string>
): Promise<{
	avgRating: number;
	avgMessSer: number;
	avgMessDM: number;
	mostCreator: { mostFrequent: string; maxCount: number };
} | null> {
	let avgRating = 0;
	ratings.forEach((element) => (avgRating += parseInt(element)));
	avgRating = avgRating / ratings.length;

	let avgMessSer: number = 0;
	messagesByServer.forEach((element) => (avgMessSer += element));
	avgMessSer = avgMessSer / messagesByServer.length;

	let avgMessDM: number = 0;
	messagesByDM.forEach((element) => (avgMessDM += element));
	avgMessDM = avgMessDM / messagesByDM.length;

	const mostCreator = findMostFrequent(creatorId);

	return {
		avgRating: avgRating,
		avgMessSer: avgMessSer,
		avgMessDM: avgMessDM,
		mostCreator: mostCreator
	};
}

// Function to find the most frequent creator
function findMostFrequent(arr: Array<string>): {
	mostFrequent: string;
	maxCount: number;
} {
	const countMap = new Map();
	let mostFrequent = arr[0];
	let maxCount = 0;

	for (let i = 0; i < arr.length; i++) {
		const num = arr[1];
		const count = (countMap.get(num) || 0) + 1;
		countMap.set(num, count);

		if (count > maxCount) {
			mostFrequent = num;
			maxCount = count;
		}
	}
	return { mostFrequent, maxCount };
}

// Function to handle ticket statistics modal
async function ticketFnc(interaction: ButtonInteraction) {
	const modal = new ModalBuilder()
		.setCustomId('getTicketStatsModal')
		.setTitle('Statistični vpogled');
	const favoriteColorInput = new TextInputBuilder()
		.setCustomId('ticketNumber')
		.setLabel('Številka ticketa, ki si ga želite ogledati')
		.setStyle(TextInputStyle.Short);
	const firstActionRow: any = new ActionRowBuilder().addComponents(
		favoriteColorInput
	);

	modal.addComponents(firstActionRow);
	await interaction.showModal(modal);
}

// Function to process modal submission
async function processModal(interaction: ModalSubmitInteraction) {
	await interaction.deferUpdate();
	const num = parseInt(interaction.fields.getTextInputValue('ticketNumber'));

	const button = new ButtonBuilder()
		.setCustomId('stat_goBack')
		.setLabel('Nazaj')
		.setStyle(ButtonStyle.Danger);
	const row: any = new ActionRowBuilder().addComponents(button);
	const allTickets = await lib.ticket.get('tickets');
	const chc = allTickets.includes(num);
	if (!chc) {
		const errorEmbed = new EmbedBuilder()
			.setColor('Red')
			.setTitle('Neveljavna številka ticketa!');
		await interaction.message?.edit({
			components: [row],
			embeds: [errorEmbed]
		});
		return;
	}
	const info = await gatherTicketInfo(num);
	if (!info) {
		const errorEmbed2 = new EmbedBuilder()
			.setColor('Red')
			.setTitle('Ni uspelo pridobiti podatkov!');
		interaction.message?.edit({
			components: [row],
			embeds: [errorEmbed2]
		});
		return;
	}
	const embed = await embedCreator(info, interaction.client);
	await interaction.message?.edit({ embeds: [embed], components: [row] });
}

// Function to gather ticket information
async function gatherTicketInfo(num: number): Promise<ticketInfoI | null> {
	const table = lib.db.table(`tt_${num}`);
	try {
		const info = await table.get('info');
		const analytics = await table.get('analytics');
		const messageAnalitys = await table.get('messageAnalitys');
		const obj = {
			info: info,
			analytics: analytics,
			messageAnalitys: messageAnalitys,
			num: num
		};
		return obj;
	} catch (e) {
		console.error(e);
		return null;
	}
}

// Function to create an embed with ticket information
async function embedCreator(
	obj: { info: any; analytics: any; messageAnalitys: any; num: number },
	client: Client
) {
	const embed = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle(`Ticket številka ${obj.num}`)
		.setTimestamp()
		.setFooter({ text: 'BCRP podatki' });

	embed.addFields({
		name: 'Podatki o ticketu',
		value: `Datum odprjta: ${await dateMaker(
			obj.analytics.date
		)}\nUra odprtja: **${obj.analytics.time}**`,
		inline: true
	});

	embed.addFields({
		name: 'Podatki o avtorju',
		value: `Tag: ${await client.users.fetch(obj.info.creatorId)}`,
		inline: true
	});

	const users = await getAllUsers(client, obj.info);

	if (users) {
		embed.addFields({
			name: 'Uporabniki v ticketu',
			value: `${users}`
		});
	}

	return embed;
}

// Function to format date
async function dateMaker(data: any) {
	const arr = data.split('_');

	const day = arr[0].split(':')[1];
	const week = arr[1].split(':')[1];
	const month = arr[2].split(':')[1];
	const year = arr[3].split(':')[1];
	const dataToReturn = `**${day}**.**${month}**.**${year}**\nTeden v letu: **${week}**`;
	return dataToReturn;
}

// Function to get all users in a ticket
async function getAllUsers(
	client: Client,
	data: { dmChannel: any; creatorId: Snowflake }
) {
	const arr = [];
	for (const id of data.dmChannel) {
		const x = await client.channels.fetch(id);
		const dm = x as DMChannel;
		const user = dm.recipient;
		if (data.creatorId != user?.id) arr.push(user);
	}

	if (arr.length === 0) return null;
	const string = arr.join('\n');
	return string;
}

// Function to create the original embed
async function originalEmbed(
	interaction: ButtonInteraction | CommandInteraction
) {
	const embed = new EmbedBuilder()
		.setTitle('Pregled statistik')
		.setDescription(
			'Izberite kategorijo statistike, ki si jo želite ogledati:'
		)
		.setColor('Random')
		.addFields(
			{ name: '\u200B', value: '\u200B' },
			{
				name: '⭐',
				value: 'Statistični vpogled v \nzadovoljstvo uporabnikov pri ticketih,\n povprečni podatki ticketov...'
			},
			{
				name: '📋',
				value: 'Statistični vpogled v \npodatke iz ticketa vaše izbere'
			}
		);
	const ratingButton = new ButtonBuilder()
		.setCustomId('stat_rating')
		.setStyle(ButtonStyle.Primary)
		.setEmoji('⭐');
	const selectTicket = new ButtonBuilder()
		.setCustomId('stat_ticket')
		.setStyle(ButtonStyle.Primary)
		.setEmoji('📋');
	const row: any = new ActionRowBuilder()
		.addComponents(ratingButton)
		.addComponents(selectTicket);
	if (interaction instanceof CommandInteraction) {
		interaction.reply({ embeds: [embed], components: [row] });
	} else {
		interaction.update({ embeds: [embed], components: [row] });
	}
}
