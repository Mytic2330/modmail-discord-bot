const { Events, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton) return;
		if (interaction.customId !== 'delete') return;
		await interaction.deferReply();
		const data = await interaction.client.db.get(interaction.guildId);
		const logChannel = await interaction.client.channels.fetch(data.logChannel);
		const channel = await interaction.client.channels.fetch(interaction.channelId);
		const wbh = await interaction.client.wbh(logChannel);

		const embed = new EmbedBuilder()
			.setColor(await interaction.client.db.get('delete'))
			.setTitle(`Ticket ${channel.name} izbrisan`)
			.setTimestamp()
			.setFooter({ text: `Izbrisal: ${interaction.user.username} | ${interaction.user.id}` });

		try {
			channel.delete();
			wbh.send({ embeds: [embed] });
		}
		catch (e) {
			console.log(e);
		}
	},
};
