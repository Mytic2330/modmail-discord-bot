import { SlashCommandBuilder } from 'discord.js';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Zapri ticket')
		.setDMPermission(false),
	async execute(interaction:any) {
		const lib = interaction.client.lib;
		lib.close(interaction, 'cls');
	},
};