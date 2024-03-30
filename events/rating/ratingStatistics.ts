/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Events,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	EmbedBuilder,
	Interaction,
	ButtonInteraction,
	ModalSubmitInteraction,
	Client,
	DMChannel,
	Snowflake
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (interaction.isButton()) {
			const ch_cd11 = interaction.customId.startsWith('stat');
			if (!ch_cd11) return;
			switchCheck(interaction);
		} else if (interaction.isModalSubmit()) {
			if (interaction.customId == 'getTicketStatsModal') {
				processModal(interaction);
			}
		}
	}
};

async function switchCheck(passedInteraction: ButtonInteraction) {
	const interaction = passedInteraction as ButtonInteraction;
	const id_inter = interaction.customId.split('_');
	switch (id_inter[1]) {
		case 'rating':
			rateFnc(interaction);
			break;
		case 'ticket':
			ticketFnc(interaction);
			break;
	}
}

async function rateFnc(interaction: Interaction) {
	const all_tickets = await lib.ticket.get('tickets');
	const arr = [];

	for (const ticket of all_tickets) {
		const data = await gatherTicketInfo(ticket);
		if (data != null) arr.push(data);
	}
}

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

async function processModal(interaction: ModalSubmitInteraction) {
	const num = parseInt(interaction.fields.getTextInputValue('ticketNumber'));

	const allTickets = await lib.ticket.get('tickets');
	const chc = allTickets.includes(num);
	if (!chc) {
		await interaction.reply({
			content: 'Neveljavna številka ticketa!',
			ephemeral: true
		});
		return;
	}

	const info = await gatherTicketInfo(num);
	if (!info) {
		interaction.reply({
			content: 'Ni uspelo pridobiti podatkov!',
			ephemeral: true
		});
		return;
	}

	const embed = await embedCreator(info, interaction.client);

	interaction.reply({ embeds: [embed], ephemeral: true });
}

async function gatherTicketInfo(num: number): Promise<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	info: any;
	analytics: any;
	messageAnalitys: any;
	num: number;
} | null> {
	const table = await lib.db.table(`tt_${num}`);
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

async function embedCreator(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// ! DOKONČAJ

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function dateMaker(data: any) {
	const arr = data.split('_');

	const day = arr[0].split(':')[1];
	const week = arr[1].split(':')[1];
	const month = arr[2].split(':')[1];
	const year = arr[3].split(':')[1];
	const dataToReturn = `**${day}**.**${month}**.**${year}**\nTeden v letu: **${week}**`;
	return dataToReturn;
}

async function getAllUsers(
	client: Client,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
