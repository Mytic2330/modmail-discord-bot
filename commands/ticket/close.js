const { SlashCommandBuilder } = require('discord.js');
const { close } = require('../../utils/close');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Zapri ticket')
		.setDMPermission(false),
	async execute(interaction) {
		close(interaction);
	},
};