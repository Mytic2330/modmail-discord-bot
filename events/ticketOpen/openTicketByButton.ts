/* eslint-disable no-inline-comments */
import {
	Events,
	ButtonInteraction,
	DMChannel,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	EmbedBuilder
} from 'discord.js';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction) {
		// CHECKS //
		if (!interaction.isButton) return; // Check if the interaction is a button
		if (interaction.customId !== 'openTicketInGuild') return; // Check if the button's custom ID is 'openTicketInGuild'
		await interaction.deferReply({ ephemeral: true }); // Defer the reply to the interaction
		// DEFINITIONS //
		const user = interaction.user; // Get the user who interacted
		const dm = await user.createDM(); // Create a DM channel with the user
		// DM CHANNEL EMBED //
		if (dm instanceof DMChannel) { // Check if the DM channel was successfully created
			const embed = new EmbedBuilder()
				.setColor('Aqua') // Set the color of the embed
				.setTitle('Odpri ticket') // Set the title of the embed
				.setDescription(
					'Pošlji sporočilo ali pritisni gumb spodaj,\nda odpreš nov ticket.' // Set the description of the embed
				);
			const button = new ButtonBuilder()
				.setCustomId('openNewTicketButtonRemoved') // Set the custom ID of the button
				.setLabel('Odpri ticket') // Set the label of the button
				.setStyle(ButtonStyle.Success); // Set the style of the button
			const row: any = new ActionRowBuilder().addComponents(button); // Create an action row and add the button to it
			try {
				await dm.send({ embeds: [embed], components: [row] }); // Send the embed and button to the DM channel
				interaction.editReply({
					content: `Prejel si sporočilo <#${dm.id}>` // Edit the reply to the interaction with a success message
				});
			} catch (e) {
				interaction.editReply({ content: 'Imaš zaprte DMe!' }); // Edit the reply to the interaction with an error message if DMs are closed
			}
		} else {
			interaction.editReply({
				content: 'Napaka! Poskusi napisati DM direktno meni.' // Edit the reply to the interaction with an error message if DM channel creation failed
			});
		}
		return;
	}
};
