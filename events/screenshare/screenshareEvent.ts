import { Interaction, Events, GuildMember, Role, VoiceState } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
	async execute(interaction: Interaction) {
		const usersWithRole = await lib.db.get('uWsr');
		const role = await lib.db.get('screenshareRole');

		for (const id1 of usersWithRole) {
			if (interaction.id != id1) continue;
			const member = await interaction?.guild?.members.fetch(id1);
			const status = member?.voice;
			const memberRoles = member?.roles.cache || []

			for (const id2 of memberRoles) {
				if (id2[0] === role) {
					userMatch(role, member, status);
				}
			}
			break;
		}
	},
};


async function userMatch(role: Role, member: GuildMember | undefined, status: VoiceState | undefined) {
	if (GuildMember && status) {
		if (!status.channelId) {
			await member?.roles.remove(role)
				.then(function() {
					lib.db.pull('uWsr', member?.id);
				},
				);
		}
	}
}
