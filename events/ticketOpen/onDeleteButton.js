const { Events, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton) return;
		if (interaction.customId !== 'delete') return;
		const locales = interaction.client.locales.events.onDeleteButtonjs;
		const data = await interaction.client.db.get(interaction.guildId);
		const logChannel = await interaction.client.channels.fetch(data.logChannel);
		const channel = await interaction.client.channels.fetch(interaction.channelId);
		const wbh = await interaction.client.wbh(logChannel);

		const embed = new EmbedBuilder()
			.setColor(await interaction.client.db.get('delete'))
			.setTitle((locales.embed.title).replace('CHANNELNAME', channel.name))
			.setTimestamp()
			.setFooter({ text: (locales.embed.footer.text)
				.replace('USERNAME', interaction.user.username)
				.replace('ID', interaction.user.id),
			});

		try {
			channel.delete();
			wbh.send({ embeds: [embed] });
		}
		catch (e) {
			console.log(e);
		}
	},
};
