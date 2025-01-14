/* eslint-disable no-inline-comments */
import {
	SlashCommandBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	CommandInteraction,
	DMChannel
} from 'discord.js';
import lib from '../../bridge/bridge';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Odstrani uporabnika iz ticketa'), // Command description
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		const locales = lib.locales.commands.removeUserjs;
		const checkOne = await lib.ticket.has(interaction.channelId); // Check if the channel is an active ticket
		if (checkOne === false) {
			interaction.reply(locales.notActiveChannel); // Reply if the channel is not active
			return;
		}
		const number = await lib.ticket.get(interaction.channelId); // Get the ticket number
		const data = await lib.db.table(`tt_${number}`).get('info'); // Get ticket info from the database
		if (interaction.guildId || data.creatorId === interaction.user.id) { // Check if the user has permission
			if (data.dmChannel.length > 1) {
				const select = new StringSelectMenuBuilder()
					.setCustomId('removeUser')
					.setPlaceholder(locales.selectMenu.placeholder); // Create a select menu

				for (const id of data.dmChannel) {
					const passedChannel = await client.channels.fetch(id);
					const dm = passedChannel as DMChannel;
					const user = dm.recipient;

					if (user?.id === data.creatorId) continue; // Skip the creator
					if (interaction.user.id === user?.id) continue; // Skip the user who initiated the command
					select.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(user?.username || 'ERROR')
							.setValue(id) // Add user to the select menu
					);
				}
				if (select.options.length === 0) {
					await interaction.reply({
						content: locales.error.nousers,
						ephemeral: true
					}); // Reply if no users are available to remove
					return;
				}
				const row: ActionRowBuilder<any> =
					new ActionRowBuilder().addComponents(select); // Create an action row with the select menu
				await interaction.reply({ components: [row], ephemeral: true }); // Reply with the select menu
			} else {
				await interaction.reply({
					content: locales.error.nousers,
					ephemeral: true
				}); // Reply if there are no users to remove
			}
		} else {
			await interaction.reply({
				content: locales.error.nopremission,
				ephemeral: true
			}); // Reply if the user does not have permission
		}
	}
};
