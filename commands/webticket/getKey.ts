/* eslint-disable no-inline-comments */
import {
	SlashCommandBuilder,
	CommandInteraction,
	PermissionFlagsBits,
	GuildMember
} from 'discord.js';
import lib from '../../bridge/bridge';
import { createAuthKey } from '../../web';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('getkey')
		.setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
		.setDMPermission(false)
		.setDescription('Pridobi ključ za dostop, do zgodovine ticketov.'), // Set command description
	async execute(interaction: CommandInteraction) {
		if (interaction.guildId) { // Check if the interaction is in a guild
			const member = interaction.member as GuildMember;
			if (member) { // Check if the member exists
				const memberRoles = member.roles.cache;
				for (const roleID of lib.settings.allowedRoles) { // Loop through allowed roles
					if (memberRoles.has(roleID)) { // Check if the member has an allowed role
						const key = await createAuthKey(); // Create an authentication key
						interaction.reply({
							content: `Vaš ključ: ${key}`, // Reply with the key
							ephemeral: true
						});
						return;
					}
				}
				interaction.reply({
					content: 'Nimaš dostopa do tega!', // Reply with no access message
					ephemeral: true
				});
			}
		}
	}
};
