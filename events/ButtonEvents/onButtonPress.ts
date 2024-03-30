import {
	Events,
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonInteraction
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction) {
		if (!interaction.isButton()) return;
		if (interaction.customId == 'closeByOpen') {
			lib.close(interaction, 'cls', null);
		} else if (interaction.customId.startsWith('rat')) {
			ratingButtonPressed(interaction);
		} else if (interaction.customId === 'openNewTicketButton') {
			newTicketButtonPressed(interaction);
		} else if (interaction.customId === 'openNewTicketButtonRemoved') {
			openNewTicketButtonRemoved(interaction);
		}
	}
};

async function ratingButtonPressed(interaction: ButtonInteraction) {
	const rating = interaction.customId.slice(3, 4);
	const ticketNumber = interaction.customId.split('_')[1];
	const locales = lib.locales.events.onButtonPressjs.ratebutton;
	const ticektDatabase = lib.db.table(`tt_${ticketNumber}`);

	await ticektDatabase.set('analytics.rating', rating);

	const rate5 = new ButtonBuilder()
		.setCustomId('completed5')
		.setEmoji(locales.ratew5.emoji)
		.setLabel(locales.ratew5.lable)
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary);
	const rate4 = new ButtonBuilder()
		.setCustomId('completed4')
		.setEmoji(locales.ratew4.emoji)
		.setLabel(locales.ratew4.lable)
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary);
	const rate3 = new ButtonBuilder()
		.setCustomId('completed3')
		.setEmoji(locales.ratew3.emoji)
		.setLabel(locales.ratew3.lable)
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary);
	const rate2 = new ButtonBuilder()
		.setCustomId('completed2')
		.setEmoji(locales.ratew2.emoji)
		.setLabel(locales.ratew2.lable)
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary);
	const rate1 = new ButtonBuilder()
		.setCustomId('completed1')
		.setEmoji(locales.ratew1.emoji)
		.setLabel(locales.ratew1.lable)
		.setDisabled(true)
		.setStyle(ButtonStyle.Secondary);

	const arr = [rate1, rate2, rate3, rate4, rate5];
	for (const x of arr) {
		const name = x.data.label;
		if (name === rating) {
			x.setStyle(ButtonStyle.Success);
		}
	}
	const creatorRow: ActionRowBuilder<any> = new ActionRowBuilder()
		.addComponents(rate5)
		.addComponents(rate4)
		.addComponents(rate3)
		.addComponents(rate2)
		.addComponents(rate1);

	await interaction.update({
		embeds: [interaction.message.embeds[0]],
		components: [creatorRow, interaction.message.components[1]]
	});
}

async function newTicketButtonPressed(interaction: ButtonInteraction) {
	lib.newTicket(undefined, interaction);
	const locales = lib.locales.events.onButtonPressjs;
	const openNewTicket = new ButtonBuilder()
		.setCustomId('openNewTicketButton')
		.setLabel(locales.newTicket)
		.setDisabled(true)
		.setStyle(ButtonStyle.Primary);
	const openRow: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
		openNewTicket
	);
	await interaction.update({
		embeds: [interaction.message.embeds[0]],
		components: [interaction.message.components[0], openRow]
	});
}

async function openNewTicketButtonRemoved(interaction: ButtonInteraction) {
	lib.newTicket(undefined, interaction);
	const locales = lib.locales.events.onButtonPressjs;
	const openNewTicket = new ButtonBuilder()
		.setCustomId('openNewTicketButton')
		.setLabel(locales.newTicket)
		.setDisabled(true)
		.setStyle(ButtonStyle.Primary);
	const openRow: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
		openNewTicket
	);
	await interaction.update({
		embeds: [interaction.message.embeds[0]],
		components: [openRow]
	});
}
