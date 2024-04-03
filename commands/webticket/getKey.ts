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
		.setDescription('Pridobi ključ za dostop, do zgodovine ticketov.'),
	async execute(interaction: CommandInteraction) {
		if (interaction.guildId) {
			const member = interaction.member as GuildMember;
			if (member) {
				const memberRoles = member.roles.cache;
				for (const roleID of lib.settings.allowedRoles) {
					if (memberRoles.has(roleID)) {
						const key = await createAuthKey();
						interaction.reply({ content: `Vaš ključ: ${key}`, ephemeral: true });
						return;
					}
				}
				interaction.reply({ content: 'Nimaš dostopa do tega!', ephemeral: true });
			}
		}
	}
};