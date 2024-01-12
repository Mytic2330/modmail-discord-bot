import { Events, EmbedBuilder, ButtonInteraction, TextChannel } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction) {
		if (!interaction.isButton) return;
		if (interaction.customId !== 'delete') return;
		const locales = lib.locales.events.onDeleteButtonjs;
		const data = await lib.db.get(interaction.guildId!);
		const info = await interaction.client.channels.fetch(data.logChannel);
		const info2 = await interaction.client.channels.fetch(
			interaction.channelId,
		);
		const channel2 = info2 as TextChannel;
		const channel = info as TextChannel;
		const wbh = await lib.wbh(channel);

		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.delete'))
			.setTitle(locales.embed.title.replace('CHANNELNAME', channel2.name))
			.setTimestamp()
			.setFooter({
				text: locales.embed.footer.text
					.replace('USERNAME', interaction.user.username)
					.replace('ID', interaction.user.id),
			});

		try {
			channel2.delete();
			wbh?.send({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
		}
	},
};
