import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	CommandInteraction
} from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const originalEmbed = require('../../events/rating/ratingStatistics');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
		.setDescription('Preveri statistike'),
	async execute(interaction: CommandInteraction) {
		originalEmbed.originalEmbed(interaction);
	}
};
