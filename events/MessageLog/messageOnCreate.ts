import { Events, EmbedBuilder, Message, Client, DMChannel, TextChannel, Embed, GuildMember, ReactionManager, MessageReaction } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.author.bot === true) return;
		if (message.guildId != undefined || message.guildId != null) {
			if (message.content.toLowerCase().startsWith('!')) {
				const check = message.content.substring(1, 4);
				if (check.toLowerCase().startsWith('adm')) {
					return;
				}
			}
		}
		if (message.guildId != undefined) {var processing: MessageReaction | undefined = await message.react('🔵');} else {processing = undefined;}
		const client = message.client;
		const locales = lib.locales.events.messageOnCreatejs;
		const status = await lib.ticket.has(message.channelId);

		switch (status) {
		case true:
			messageHandeler(message, client, locales, processing);
			break;
		case false:
			lib.newTicket(message, undefined);
			break;
		}
	},
};

async function getName(member: GuildMember): Promise<{ username: string, rank: string }> {
	const userId = member.user.id;
	const userRankCache = lib.cache.userRanks;
	if (userRankCache.has(userId)) {
		return userRankCache.get(userId)!;
	}
    const username = member.user.username;
    const enableRanks = await lib.db.get('enableRanks');
    if (!enableRanks) {
		const result = { username, rank: "Unknown" };
		userRankCache.set(userId, result);
        return result;
    }
    const roles = await lib.db.get('ranks');
    if (!roles) {
		const result = { username, rank: "Unknown" };
		userRankCache.set(userId, result);
        return result;
    }

    const memberRoles = member.roles.cache;

    for (const roleID in roles) {
        if (roleID !== 'enable' && memberRoles.has(roleID)) {
            const rank: string = roles[roleID];
			const result = { username, rank };
			userRankCache.set(userId, result);
            return result;
        }
    }
	const result = { username, rank: "Unknown" };
    userRankCache.set(userId, result);
    return result;
}
async function messageHandeler(message: Message, client: Client, locales:any, processing: MessageReaction | undefined) {
	var reciveChannelEmbed: EmbedBuilder;
	if (message.guildId != undefined || message.guildId != null) {
		const guild = await client.guilds.fetch(message.guildId);
		const member = await guild.members.fetch(message.author.id);
		const returned = await getName(member);

		reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: returned.username, iconURL: member.displayAvatarURL() })
		.setColor(await lib.db.get('color.recive'))
		//.setTitle(locales.messageProcessing.reciveNewMessageEmbed.title)
		.setTimestamp()
		// ${locales.messageProcessing.reciveNewMessageEmbed.footer.text} | 
		.setFooter({ text: `Rank: ${returned.rank}`, iconURL: locales.messageProcessing.reciveNewMessageEmbed.footer.iconURL });
	}
	else {
		const user = await client.users.fetch(message.author.id);
		reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.displayName, iconURL: user.displayAvatarURL() })
		.setColor(await lib.db.get('color.recive'))
		//.setTitle(locales.messageProcessing.reciveNewMessageEmbed.title)
		.setTimestamp()
		.setFooter({ text: `${locales.messageProcessing.reciveNewMessageEmbed.footer.text}`, iconURL: locales.messageProcessing.reciveNewMessageEmbed.footer.iconURL });
	}

	if (message.content) {
		reciveChannelEmbed.setDescription(message.content);
	}
	if (message.attachments) {
		let num = 1;
		message.attachments.forEach((keys:any) => {
			reciveChannelEmbed.addFields({ name: `${locales.messageProcessing.attachment} ${num}`, value: `[**LINK**](${keys.attachment})` });
			num++;
		});
	}
	messageReciverSwitch(message, reciveChannelEmbed, client, processing);
}
async function messageReciverSwitch(message: Message, reciveChannelEmbed:any, client: Client, processing: MessageReaction | undefined) {
	const switchStatus = message.guildId === null;

	switch (switchStatus) {
	case true: {
		const sts = await sendToServer(message, reciveChannelEmbed);
		afterSendErrorHandler(message, client, 'server', sts, processing);
		break;
	}
	case false: {
		const sts = await sendToDMChannel(message, reciveChannelEmbed);
		afterSendErrorHandler(message, client, 'DM', sts, processing);
		break;
	}
	default: {
		console.error('ERR');
	}
	}
}

async function afterSendErrorHandler(message: Message, client: Client, type:string, values:any, processing: MessageReaction | undefined) {
	const locales = lib.locales.events.messageOnCreatejs.errorHandler;
	if (type === 'DM') {
		message.react('✅');
		processing?.remove();
		const embed = await errorEmbedAsemblyClient(message, client, values, locales);
		try {
			if (embed) errorEmbedSender(message, embed);
		}
		catch (e) {
			console.error(e);
		}
		return;
	}

	if (type === 'server') {
		message.react('✅');
		const embed = await errorEmbedAsemblyServer(client, values, locales);
		try {
			if (embed) errorEmbedSender(message, embed);
		}
		catch (e) {
			console.error(e);
		}
	}
}
async function errorEmbedAsemblyServer(client: Client, values:any, locales:any) {
	if (values.channels.length > 1 && values.errorSender.length > 0) {
		var one_time_warn_EMBED:any;
		one_time_warn_EMBED = new EmbedBuilder()
			.setColor(await lib.db.get('color.error'))
			.setTitle(locales.oneOrMore.title)
			.setTimestamp()
			.setFooter({ text: locales.oneOrMore.footer.text, iconURL: locales.oneOrMore.footer.iconURL });
		let x = 1;
		for (const id of values.errorSender) {
			try {
				const recivedChannel = await client.channels.fetch(id);
				const chan = recivedChannel as DMChannel;
				one_time_warn_EMBED.addFields({ name: id, value: (locales.oneOrMore.fields.user).replace('USERNAME', chan?.recipient) });
			}
			catch (e) {
				console.error(e);
				one_time_warn_EMBED.addFields({ name: (locales.oneOrMore.fields.unknownUser).replace('NUMBER', x), value: (locales.oneOrMore.fields.unknownUserex).replace('IDNUM', id) });
				x++;
			}
		}
	}
	return one_time_warn_EMBED;
}
async function errorEmbedAsemblyClient(message: Message, client: Client, values:any, locales:any) {
	if (values.channels.length === values.errorSender.length) {
		const embd = new EmbedBuilder()
			.setColor(await lib.db.get('color.error'))
			.setTitle(locales.messageNotDelivered.title)
			.setDescription(locales.messageNotDelivered.description)
			.setTimestamp()
			.setFooter({ text: locales.messageNotDelivered.footer.text, iconURL: locales.messageNotDelivered.footer.iconURL });

		errorEmbedSender(message, embd);
		return null;
	}
	if (values.channels.length === 0) {
		const embd = new EmbedBuilder()
			.setColor(await lib.db.get('color.error'))
			.setTitle(locales.unknownError.title)
			.setDescription(locales.unknownError.description)
			.setTimestamp()
			.setFooter({ text: locales.unknownError.footer.text, iconURL: locales.unknownError.footer.iconURL });

		errorEmbedSender(message, embd);
		return null;
	}
	if (values.channels.length > 1 && values.errorSender.length > 0) {
		var one_time_warn_EMBED:any;
		one_time_warn_EMBED = new EmbedBuilder()
			.setColor(await lib.db.get('color.error'))
			.setTitle(locales.oneOrMore.title)
			.setTimestamp()
			.setFooter({ text: locales.oneOrMore.footer.text, iconURL: locales.oneOrMore.footer.iconURL });
		let x = 1;
		for (const id of values.errorSender) {
			try {
				const recivedChannel = await client.channels.fetch(id);
				const chan = recivedChannel as DMChannel;
				one_time_warn_EMBED.addFields({ name: id, value: (locales.oneOrMore.fields.user).replace('USERNAME', chan.recipient) });
			}
			catch (e) {
				console.error(e);
				one_time_warn_EMBED.addFields({ name: (locales.oneOrMore.fields.unknownUser).replace('NUMBER', x), value: (locales.oneOrMore.fields.unknownUserex).replace('IDNUM', id) });
				x++;
			}
		}
	}
	return one_time_warn_EMBED;
}
async function sendToDMChannel(message: Message, reciveChannelEmbed:any) {
	const client = message.client;
	const ticketNumberDatabse = await lib.ticket.get(message.channelId);
	const channels = await lib.db.table(`tt_${ticketNumberDatabse}`).get('info.dmChannel');
	const errorSender = [];
	infoWriter(client, ticketNumberDatabse, message, 'toDM');
	for (const id of channels) {
		try {
			const recivedChannel = await client.channels.fetch(id);
			const channel = recivedChannel as DMChannel;
			const msh = await channel.send({ embeds: [reciveChannelEmbed] });
			sendDBWrite(client, ticketNumberDatabse, message, msh);
		}
		catch (e) {
			errorSender.push(id);
		}
	}
	return { errorSender, channels };
}

async function sendToServer(message: Message, reciveChannelEmbed:any) {
	resetInaStatus(message);
	const client = message.client;
	const status = await sendToDMByOtherDM(message, reciveChannelEmbed);
	const ticketNumberDatabse = await lib.ticket.get(message.channelId);
	const reciverData = await lib.db.table(`tt_${ticketNumberDatabse}`).get('info');
	const reciveChannel = await client.channels.fetch(reciverData.guildChannel);
	const channel = reciveChannel as TextChannel;
	infoWriter(client, ticketNumberDatabse, message, 'toServer');
	try {
		const msh = await channel.send({ embeds: [reciveChannelEmbed] });
		sendDBWrite(client, ticketNumberDatabse, message, msh);
		return status;
	}
	catch (e) {
		return status;
	}
}

async function sendToDMByOtherDM(message: Message, reciveChannelEmbed:any) {
	const client = message.client;
	const ticketNumberDatabse = await lib.ticket.get(message.channelId);
	const reciverData = await lib.db.table(`tt_${ticketNumberDatabse}`).get('info');
	const channels = reciverData.dmChannel;
	const errorSender = [];
	for (const id of channels) {
		if (id === message.channelId) continue;
		try {
			const recivedChannel = await client.channels.fetch(id);
			const channel = recivedChannel as DMChannel
			const msh = await channel.send({ embeds: [reciveChannelEmbed] });
			sendDBWrite(client, ticketNumberDatabse, message, msh);
		}
		catch (e) {
			errorSender.push(id);
		}
	}
	return { errorSender, channels };
}

async function errorEmbedSender(message: Message, embed: EmbedBuilder) {
	await message.channel.send({ embeds: [embed] });
	return;
}

async function resetInaStatus(message: Message) {
	const ticketNumberDatabse = await lib.ticket.get(message.channelId);
	const inaQueue = await lib.ticket.get('inaQueue');
	if (!inaQueue) return;

	for (const number of inaQueue) {
		if (number == ticketNumberDatabse) {
			const db = lib.db.table(`tt_${ticketNumberDatabse}`);
			await db.set('inaData', 172800000);
		}
	}

}

async function infoWriter(client: Client, ticketNumberDatabse: number, message: Message, x: string) {
	if (x === 'toServer') {
		await lib.db.table(`tt_${ticketNumberDatabse}`).set(message.id, {
			'mesageData': {
				'channelId': message.channelId,
				'guildId': message.guildId,
				'author': message.author.id,
			},
		});
		await lib.db.table(`tt_${ticketNumberDatabse}`).add('messageAnalitys.messages.sentByDM', 1);
		await lib.db.table(`tt_${ticketNumberDatabse}`).push('messageAnalitys.messages.DMMessagesUsers', { 'user': message.author.id });
		return;
	}
	if (x === 'toDM') {
		await lib.db.table(`tt_${ticketNumberDatabse}`).set(message.id, {
			'mesageData': {
				'channelId': message.channelId,
				'guildId': message.guildId,
				'author': message.author.id,
			},
		});
		await lib.db.table(`tt_${ticketNumberDatabse}`).add('messageAnalitys.messages.sentByServer', 1);
		await lib.db.table(`tt_${ticketNumberDatabse}`).push('messageAnalitys.messages.serverMessagesUsers', { 'user': message.author.id });
	}
}

async function sendDBWrite(client: Client, ticketNumberDatabse: number, message:any, msh:any) {
	await lib.db.table(`tt_${ticketNumberDatabse}`).push(`${message.id}.recive`, { 'channelId': msh.channelId, 'messageId': msh.id, 'guildId': msh.guildId });
}

function clearCache() {
	console.info('CLEARED RANK CACHE')
	lib.cache.userRanks.clear()
}

setInterval(clearCache, 3600000);