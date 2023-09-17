/* eslint-disable no-redeclare */
/* eslint-disable no-undef */
const { Events, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot === true) return;

		if (message.guildId != undefined) {
			if (message.content.toLowerCase().startsWith('!')) {
				const check = message.content.substring(1, 4);
				if (check.toLowerCase().startsWith('adm')) {
					return;
				}
			}
		}

		const client = message.client;
		const locales = client.locales.events.messageOnCreatejs;
		const status = await client.ticket.has(message.channelId);

		switch (status) {
		case true:
			messageHandeler(message, client, locales);
			break;
		case false:
			newTicketOpen(message, client, locales);
			break;
		}
	},
};

async function newTicketOpen(message, client, locales) {
	if (message.guildId !== null) return;
	if (await client.ticket.has(message.author.id) === true) return;
	const channel = await client.channels.fetch(message.channelId);
	const embed = new EmbedBuilder()
		.setTitle(locales.userSelectCategory.embed.title)
		.setDescription(locales.userSelectCategory.embed.description)
		.setFooter({ text: locales.userSelectCategory.embed.footer.text, iconURL: locales.userSelectCategory.embed.footer.iconURL })
		.setTimestamp();

	const select = new StringSelectMenuBuilder()
		.setCustomId('ticket')
		.setPlaceholder(locales.userSelectCategory.SelectMenuPlaceholder);

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

async function messageHandeler(message, client, locales) {
	const user = await client.users.fetch(message.author.id);
	const reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await client.db.get('recive'))
		.setTitle(locales.messageProcessing.reciveNewMessageEmbed.title)
		.setTimestamp()
		.setFooter({ text: `${locales.messageProcessing.reciveNewMessageEmbed.footer.text}`, iconURL: locales.messageProcessing.reciveNewMessageEmbed.footer.iconURL });


	const channelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await client.db.get('send'))
		.setTitle(locales.messageProcessing.sendNewMessageEmbed.title)
		.setTimestamp()
		.setFooter({ text: `${locales.messageProcessing.sendNewMessageEmbed.footer.text}`, iconURL: locales.messageProcessing.sendNewMessageEmbed.footer.iconURL });


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
	messageReciverSwitch(message, reciveChannelEmbed, client, channelEmbed);
}
async function messageReciverSwitch(message, reciveChannelEmbed, client) {
	const switchStatus = message.guildId === null;

	switch (switchStatus) {
	case true: {
		const sts = await sendToServer(message, reciveChannelEmbed);
		afterSendErrorHandler(message, client, 'server', sts);
		break;
	}
	case false: {
		const sts = await sendToDMChannel(message, reciveChannelEmbed);
		afterSendErrorHandler(message, client, 'DM', sts);
		break;
	}
	default: {
		console.log('ERR');
	}
	}
}


async function afterSendErrorHandler(message, client, type, values) {
	if (type === 'DM') {
		if (values.channels.length === values.errorSender.length) {
			const embd = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Sporočila ni bilo mogoče dostaviti!')
				.setDescription('Uporabnik/i ticketa niso dosegljivi! \nMožen razlog je, da je izklopil `allow direct messages`.\n Če uporabnika ne morate ponovno kontaktirate, priporočamo zaprtje ticketa.')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });

			errorEmbedSender(message, embd, client, type);
			return;
		}
		if (values.channels.length === 0) {
			const embd = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Prišlo je do napake!')
				.setDescription('Prosimo kontaktirajte skribnika bota, da preveri konzolo za neznane pojave.\n Ne moremo vam potrditi, da je sporočilo prispelo uporabniku.')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });

			errorEmbedSender(message, embd, client, type);
			return;
		}
		if (values.channels.length > 1 && values.errorSender.length > 0) {
			var one_time_warn_EMBED = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Enemu ali več uporabnikom ni bilo možno dostaviti sporočila!')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });
			let x = 1;
			for (const id in values.errorSender) {
				try {
					const chan = await client.channels.fetch(id);
					one_time_warn_EMBED.addFields({ name: id, value: `Uporabnik ${chan.recipient.username} NI prejel sporočila!` });
				}
				catch (e) {
					console.log(e);
					one_time_warn_EMBED.addFields({ name: `Neznan uporabnik ${x}`, value: `Uporabnik \`NI BILO MOGOČE PRIDOBITI UPORABNIKA\` NI prejel sporočila! \nID: ${id}` });
					x++;
				}
			}

		}
		try {
			await message.react('✅');
			if (one_time_warn_EMBED) errorEmbedSender(message, one_time_warn_EMBED, client, type);
		}
		catch (e) {
			console.log(e);
		}
	}

	if (type === 'server') {
		if (values.channels.length > 1 && values.errorSender.length > 0) {
			var one_time_warn_EMBED = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Enemu ali več uporabnikom ni bilo možno dostaviti sporočila!')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });
			let x = 1;
			for (const id in values.errorSender) {
				try {
					const chan = await client.channels.fetch(id);
					one_time_warn_EMBED.addFields({ name: id, value: `Uporabnik ${chan.recipient.username} NI prejel sporočila!` });
				}
				catch (e) {
					console.log(e);
					one_time_warn_EMBED.addFields({ name: `Neznan uporabnik ${x}`, value: `Uporabnik \`NI BILO MOGOČE PRIDOBITI UPORABNIKA\` NI prejel sporočila! \nID: ${id}` });
					x++;
				}
			}

		}
		if (one_time_warn_EMBED) errorEmbedSender(message, one_time_warn_EMBED, client, type);
		await message.react('✅');
	}


}
async function sendToDMChannel(message, reciveChannelEmbed) {
	const client = message.client;
	const reciverData = await client.ticket.get(message.channelId);
	const channels = reciverData.channel;
	const errorSender = [];
	for (id of channels) {
		try {
			const channel = await client.channels.fetch(id);
			await channel.send({ embeds: [reciveChannelEmbed] });
		}
		catch (e) {
			errorSender.push(id);
		}
	}
	return { errorSender, channels };
}

async function sendToServer(message, reciveChannelEmbed) {
	const client = message.client;
	const status = await sendToDMByOtherDM(message, reciveChannelEmbed);

	const reciverData = await client.ticket.get(message.channelId);
	const recive = await client.channels.fetch(reciverData.server);
	const wbh = await client.wbh(recive);
	try {
		wbh.send({ embeds: [reciveChannelEmbed] });
		return status;
	}
	catch (e) {
		console.log(e);
		return status;
	}
}

async function sendToDMByOtherDM(message, reciveChannelEmbed) {
	const client = message.client;
	const reciverData = await client.ticket.get(message.channelId);
	const channels = reciverData.channel;
	const errorSender = [];
	for (id of channels) {
		if (id === message.channelId) continue;
		try {
			const channel = await client.channels.fetch(id);
			await channel.send({ embeds: [reciveChannelEmbed] });
		}
		catch (e) {
			console.log(e);
			errorSender.push(id);
		}
	}
	return { errorSender, channels };
}

async function errorEmbedSender(message, embed, client, type) {
	if (type === 'server') {
		message.channel.send({ embeds: [embed] });
		return;
	}
	if (type === 'DM') {
		const channel = await client.channels.fetch(message.channel.id);
		const wbh = await client.wbh(channel);

		await wbh.send({ embeds: [embed] });
		return;
	}
}
