/* eslint-disable indent */
const { Events, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot === true) return;
		const client = message.client;
		const status = await client.ticket.has(message.channelId);
		if (status === false) {
			if (message.guildId === null) {
				if (await client.ticket.has(message.author.id) === true) return;
				const channel = await client.channels.fetch(message.channelId);
				const embed = new EmbedBuilder()
					.setTitle('Potrebujete pomoč?')
					.setDescription('Uporabite spodnji meni, da izberete kategorijo pomoči. Prosimo za strpnost.\nPočakajte na potrdilo odprtja.')
					.setFooter({ text: 'BlueCityRP', iconURL: 'https://cdn.discordapp.com/icons/978368922527101059/a_4c5511c4cb5008ec4a0aeb0ab63c8368.gif?size=4096&width=0&height=256' })
					.setTimestamp();

				const select = new StringSelectMenuBuilder()
					.setCustomId('ticket')
					.setPlaceholder('Izberi kategorijo!');

				client.settings.categories.forEach(x => {
					const options = x.split('_');
					select.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(options[1])
							.setDescription(options[2])
							.setValue(options[0]),
					);
				});

				const row = new ActionRowBuilder()
					.addComponents(select);

				try {
					channel.send({ embeds: [embed], components: [row] });
				}
				catch (e) {
					console.log(e);
				}
			}
		}
		else if (status === true) {
			const channel = await client.channels.fetch(message.channelId);
			const reciverData = await client.ticket.get(message.channelId);
			const recive = await client.channels.fetch(reciverData.channel);

			const user = await client.users.fetch(message.author.id);

			const reciveChannelEmbed = new EmbedBuilder()
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setColor(await client.db.get('recive'))
				.setTitle('Novo sporočilo')
				.setTimestamp()
				.setFooter({ text: 'ID: ' + user.id });


			const channelEmbed = new EmbedBuilder()
				.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
				.setColor(await client.db.get('send'))
				.setTitle('Sporočilo poslano!')
				.setTimestamp()
				.setFooter({ text: 'ID: ' + user.id });


			if (message.content) {
				channelEmbed.setDescription(message.content);
				reciveChannelEmbed.setDescription(message.content);
			}
			if (message.attachments) {
				let num = 1;
				message.attachments.forEach((keys) => {
					channelEmbed.addFields({ name: `Attachment ${num}`, value: `[**LINK**](${keys.attachment})` });
					reciveChannelEmbed.addFields({ name: `Attachment ${num}`, value: `[**LINK**](${keys.attachment})` });
					num++;
				});
			}
			if (message.guildId === null) {
				const wbh = await client.wbh(recive);
				try {
					wbh.send({ embeds: [reciveChannelEmbed], files: message.attachments.map(attachment => attachment.url) });
					/*message.attachments.forEach((keys) => {
						wbh.send({ content: keys.attachment });
					});*/
				}
				catch (e) {
					console.log(e);
				}
			}
			else {
				//if (message.content) {
					recive.send({ embeds: [reciveChannelEmbed], files: message.attachments.map(attachment => attachment.url) });
				//}
				/*message.attachments.forEach((keys) => {
					recive.send({ content: keys.attachment });
				});*/
			}

			//DELETING


			if (message.guildId === null) {
				channel.send({ embeds: [channelEmbed], files: message.attachments.map(attachment => attachment.url) });
				/*message.attachments.forEach((keys) => {
					channel.send({ content: keys.attachment });
				});*/
			}
			else {
				const wbh = await client.wbh(channel);
				try {
					wbh.send({ embeds: [channelEmbed], files: message.attachments.map(attachment => attachment.url) });
					message.delete();
				}
				catch (e) {
					console.log(e);
				}
			}

		}

	},
};