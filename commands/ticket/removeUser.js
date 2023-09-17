const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Odstrani uporabnika iz ticketa'),
	async execute(interaction) {
		const client = interaction.client;
		const checkOne = await client.ticket.has(interaction.channelId);
		if (checkOne === false) {
			interaction.reply('Ta kanal ni aktiven ticket!\n Prosim uporabite v kanalu z ticketom.');
			return;
		}
		const data = await client.ticket.get(interaction.channelId);

		if (data.users.length > 1) {
			const select = new StringSelectMenuBuilder()
				.setCustomId('removeUser')
				.setPlaceholder('Izberite uporabnika za odstranitev!');

			for (const id of data.users) {
				if (id === data.author) continue;
				if (interaction.user.id === id) continue;
				const user = await client.users.fetch(id);
				select.addOptions(
					new StringSelectMenuOptionBuilder()
						.setLabel(user.username)
						.setValue(id),
				);
			}
			if (select.options.length === 0) {
				await interaction.reply({ content: 'Ni uporabnikov za odstraniti!', ephemeral: true });
				return;
			}
			const row = new ActionRowBuilder()
				.addComponents(select);
			await interaction.reply({ components: [row], ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'Ni uporabnikov za odstraniti!', ephemeral: true });
		}
	},
};
