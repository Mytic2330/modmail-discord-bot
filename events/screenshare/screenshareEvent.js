const { Events } = require('discord.js');
module.exports = {
	name: Events.VoiceStateUpdate,
	once: false,
	async execute(interaction) {
		const client = interaction.client;
		const usersWithRole = await client.db.get('uWsr');
		const role = await client.db.get('screenshareRole');

		for (const id1 of usersWithRole) {
			if (interaction.id != id1) continue;
			const member = await interaction.guild.members.fetch(id1);
			const status = member.voice;

			for (const id2 of member.roles.cache) {
				if (id2[0] === role) {
					userMatch(client, role, member, status);
				}
			}
			break;
		}
	},
};


async function userMatch(client, role, member, status) {
	if (!status.channelId) {
		await member.roles.remove(role)
			.then(function() {
				client.db.pull('uWsr', member.id);
			},
			);
	}
}
