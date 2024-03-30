import {
	Events,
	ButtonInteraction,
	DMChannel,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	EmbedBuilder,
} from 'discord.js';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction) {
		// CHECKS //
		if (!interaction.isButton) return;
		if (interaction.customId !== 'openTicketInGuild') return;
		await interaction.deferReply({ ephemeral: true });
		// DEFINITIONS //
		const user = interaction.user;
		const dm = await user.createDM();
		// DM CHANNEL EMBED //
		if (dm instanceof DMChannel) {
			const embed = new EmbedBuilder()
				.setColor('Aqua')
				.setTitle('Odpri ticket')
				.setDescription(
					'Pošlji sporočilo ali pritisni gumb spodaj,\nda odpreš nov ticket.',
				);
			const button = new ButtonBuilder()
				.setCustomId('openNewTicketButtonRemoved')
				.setLabel('Odpri ticket')
				.setStyle(ButtonStyle.Success);
			const row: any = new ActionRowBuilder().addComponents(button);
			try {
				await dm.send({ embeds: [embed], components: [row] });
				interaction.editReply({
					content: `Prejel si sporočilo <#${dm.id}>`,
				});
			} catch (e) {
				interaction.editReply({ content: 'Imaš zaprte DMe!' });
			}
		} else {
			interaction.editReply({
				content: 'Napaka! Poskusi napisati DM direktno meni.',
			});
		}
		return;
	},
};
