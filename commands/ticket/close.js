const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Zapri ticket')
		.setDMPermission(false),
	async execute(interaction) {
		const lib = interaction.client.lib;
		lib.close(interaction, 'cls');
	},
};