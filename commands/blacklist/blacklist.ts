/* eslint-disable no-inline-comments */
import {
	SlashCommandBuilder,
	CommandInteraction,
	PermissionFlagsBits
} from 'discord.js';
import lib from '../../bridge/bridge';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.addUserOption((option) =>
			option
				.setName('user')
				.setRequired(true)
				.setDescription('Uporabnik, ki bo blacklistan')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Debug command'), // Sets up the slash command
	async execute(interaction: CommandInteraction) {
		const user = interaction.options.getUser('user');
		if (user) {
			const users = await lib.ticket.get('blacklist');
			if (users.includes(user.id)) {
				interaction.reply({
					ephemeral: true,
					content: 'Uporabnik je že blacklistan!'
				});
				return;
			} else {
				await lib.ticket.push('blacklist', user.id); // Adds the user to the blacklist
				interaction.reply({
					ephemeral: true,
					content: 'Uporabnik blacklistan!'
				});
				return;
			}
		} else {
			interaction.reply({
				ephemeral: true,
				content: 'Uporabnik ni najden!'
			});
			return;
		}
	}
};
