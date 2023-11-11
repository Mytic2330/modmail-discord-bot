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
			newTicketOpen(message, client, locales, false);
			break;
		}
	},
	newTicketOpen,
};

async function newTicketOpen(message, client, locales, comesFromButton) {
	if (message.guildId !== null) return;
	if (comesFromButton == false) {
		if (await client.ticket.has(message.author.id) === true) return;
	}
	if (comesFromButton == true) {
		if (await client.ticket.has(message.user.id) === true) return;
	}
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

	if (message.content) {
		reciveChannelEmbed.setDescription(message.content);
	}
	if (message.attachments) {
		let num = 1;
		message.attachments.forEach((keys) => {
			reciveChannelEmbed.addFields({ name: `${locales.messageProcessing.attachment} ${num}`, value: `[**LINK**](${keys.attachment})` });
			num++;
		});
	}
	messageReciverSwitch(message, reciveChannelEmbed, client);
	resetInaStatus(message, client);
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
	const locales = client.locales.events.messageOnCreatejs.errorHandler;
	if (type === 'DM') {
		if (values.channels.length === values.errorSender.length) {
			const embd = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle(locales.messageNotDelivered.title)
				.setDescription(locales.messageNotDelivered.description)
				.setTimestamp()
				.setFooter({ text: locales.messageNotDelivered.footer.text, iconURL: locales.messageNotDelivered.footer.iconURL });

			errorEmbedSender(message, embd, client, type);
			return;
		}
		if (values.channels.length === 0) {
			const embd = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle(locales.unknownError.title)
				.setDescription(locales.unknownError.description)
				.setTimestamp()
				.setFooter({ text: locales.unknownError.footer.text, iconURL: locales.unknownError.footer.iconURL });

			errorEmbedSender(message, embd, client, type);
			return;
		}
		if (values.channels.length > 1 && values.errorSender.length > 0) {
			var one_time_warn_EMBED = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle(locales.oneOrMore.title)
				.setTimestamp()
				.setFooter({ text: locales.oneOrMore.footer.text, iconURL: locales.oneOrMore.footer.iconURL });
			let x = 1;
			for (const id in values.errorSender) {
				try {
					const chan = await client.channels.fetch(id);
					one_time_warn_EMBED.addFields({ name: id, value: (locales.oneOrMore.fields.user).replace('USERNAME', chan.recipient.username) });
				}
				catch (e) {
					console.log(e);
					one_time_warn_EMBED.addFields({ name: (locales.oneOrMore.fields.unknownUser).replace('NUMBER', x), value: (locales.oneOrMore.fields.unknownUserex).replace('IDNUM', id) });
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
				.setTitle(locales.oneOrMore.title)
				.setTimestamp()
				.setFooter({ text: locales.oneOrMore.footer.text, iconURL: locales.oneOrMore.footer.iconURL });
			let x = 1;
			for (const id in values.errorSender) {
				try {
					const chan = await client.channels.fetch(id);
					one_time_warn_EMBED.addFields({ name: id, value: (locales.oneOrMore.fields.user).replace('USERNAME', chan.recipient.username) });
				}
				catch (e) {
					console.log(e);
					one_time_warn_EMBED.addFields({ name: (locales.oneOrMore.fields.unknownUser).replace('NUMBER', x), value: (locales.oneOrMore.fields.unknownUserex).replace('IDNUM', id) });
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
	const ticketNumberDatabse = await client.ticket.get(message.channelId);
	const channels = await client.db.table(`tt_${ticketNumberDatabse}`).get('info.dmChannel');
	const errorSender = [];
	await client.db.table(`tt_${ticketNumberDatabse}`).set(message.id, {
		'mesageData': {
			'channelId': message.channelId,
			'guildId': message.guildId,
			'author': message.authorId,
		},
	});
	await client.db.table(`tt_${ticketNumberDatabse}`).add('messageAnalitys.messages.sentByServer', 1);
	await client.db.table(`tt_${ticketNumberDatabse}`).push('messageAnalitys.messages.serverMessagesUsers', { 'user': message.author.id });
	for (const id of channels) {
		try {
			const channel = await client.channels.fetch(id);
			const msh = await channel.send({ embeds: [reciveChannelEmbed] });
			await client.db.table(`tt_${ticketNumberDatabse}`).push(`${message.id}.recive`, `${msh.id}_${msh.channelId}`);
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
	const ticketNumberDatabse = await client.ticket.get(message.channelId);
	const reciverData = await client.db.table(`tt_${ticketNumberDatabse}`).get('info');
	const recive = await client.channels.fetch(reciverData.guildChannel);
	const wbh = await client.wbh(recive);
	await client.db.table(`tt_${ticketNumberDatabse}`).set(message.id, {
		'mesageData': {
			'channelId': message.channelId,
			'guildId': message.guildId,
			'author': message.authorId,
		},
	});
	await client.db.table(`tt_${ticketNumberDatabse}`).add('messageAnalitys.messages.sentByDM', 1);
	await client.db.table(`tt_${ticketNumberDatabse}`).push('messageAnalitys.messages.DMMessagesUsers', { 'user': message.author.id });
	try {
		const msh = await wbh.send({ embeds: [reciveChannelEmbed] });
		await client.db.table(`tt_${ticketNumberDatabse}`).push(`${message.id}.recive`, `${msh.id}_${msh.channelId}`);
		return status;
	}
	catch (e) {
		console.log(e);
		return status;
	}
}

async function sendToDMByOtherDM(message, reciveChannelEmbed) {
	const client = message.client;
	const ticketNumberDatabse = await client.ticket.get(message.channelId);
	const reciverData = await client.db.table(`tt_${ticketNumberDatabse}`).get('info');
	const channels = reciverData.dmChannel;
	const errorSender = [];
	for (const id of channels) {
		if (id === message.channelId) continue;
		try {
			const channel = await client.channels.fetch(id);
			const msh = await channel.send({ embeds: [reciveChannelEmbed] });
			await client.db.table(`tt_${ticketNumberDatabse}`).push(`${message.id}.recive`, `${msh.id}_${msh.channelId}`);
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

async function resetInaStatus(message, client) {
	const ticketNumberDatabse = await client.ticket.get(message.channelId);
	const inaQueue = await client.ticket.get('inaQueue');
	if (!inaQueue) return;

	for (const number of inaQueue) {
		if (number == ticketNumberDatabse) {
			const db = await client.db.table(`tt_${ticketNumberDatabse}`);
			await db.set('inaData', 172800000);
		}
	}

}