import { Events, EmbedBuilder } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: any) {
		if (!interaction.isButton) return;
		if (interaction.customId !== 'delete') return;
		const locales = lib.locales.events.onDeleteButtonjs;
		const data = await lib.db.get(interaction.guildId);
		const logChannel = await interaction.client.channels.fetch(data.logChannel);
		const channel = await interaction.client.channels.fetch(interaction.channelId);
		const wbh = await lib.wbh(logChannel);

		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.delete'))
			.setTitle((locales.embed.title).replace('CHANNELNAME', channel.name))
			.setTimestamp()
			.setFooter({ text: (locales.embed.footer.text)
				.replace('USERNAME', interaction.user.username)
				.replace('ID', interaction.user.id),
			});

		try {
			channel.delete();
			wbh?.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	},
};
