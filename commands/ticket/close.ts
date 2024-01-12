import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Zapri ticket')
		.setDMPermission(false),
	async execute(interaction: CommandInteraction) {
		lib.close(interaction, 'cls', null);
	},
};
