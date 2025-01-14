/* eslint-disable no-inline-comments */
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import lib from '../../bridge/bridge';

// Export the module
module.exports = {
	// Define the command data
	data: new SlashCommandBuilder()
		.setName('close') // Set command name
		.setDescription('Zapri ticket') // Set command description
		.setDMPermission(false), // Set DM permission
	// Define the execute function
	async execute(interaction: CommandInteraction) {
		lib.close(interaction, 'cls', null); // Call the close function from the library
	}
};
