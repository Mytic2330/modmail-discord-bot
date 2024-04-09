/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Events,
	ChannelType,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	StringSelectMenuInteraction,
	Guild,
	CategoryChannel,
	TextChannel,
	GuildMember,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ModalSubmitInteraction
} from 'discord.js';
import lib from '../../bridge/bridge';
import settings from '../../interfaces/settings';
module.exports = {
	name: Events.InteractionCreate,
	async execute(
		interaction: ModalSubmitInteraction | StringSelectMenuInteraction
	) {
		// CHECK IF IT IS ANY OTHER INTERACTION //
		if (interaction.isStringSelectMenu()) {
			if (interaction.customId !== 'ticket') return;
			checksAndPass(interaction, 'string');
		}
		if (interaction.isModalSubmit()) {
			if (!interaction.customId.startsWith('openTicketModal')) return;
			checksAndPass(interaction, 'modal');
		}
	}
};

async function checksAndPass(
	interaction: ModalSubmitInteraction | StringSelectMenuInteraction,
	type: string
) {
	const status = await checkStatus(interaction);
	if (status.code !== 200) {
		sendError(interaction, status);
		return;
	}

	if (type === 'modal') {
		openNewTicket(
			interaction as ModalSubmitInteraction,
			interaction.customId.split('_')[1]
		);
		return;
	}
	if (type === 'string') {
		stringSelect(interaction as StringSelectMenuInteraction);
		return;
	}
}

async function stringSelect(interaction: StringSelectMenuInteraction) {
	const indexOfType: string = interaction.values[0];
	const typeOfHelp: settings['categories'][0] =
		lib.settings.categories[Number(indexOfType)];
	if (typeOfHelp.modal.enable == false) {
		openNewTicket(interaction, indexOfType);
		return;
	}
	const modal = await createModal(interaction, typeOfHelp);
	await interaction.showModal(modal);
}

async function createModal(
	interaction: StringSelectMenuInteraction,
	modalSettings: any
) {
	const modal = new ModalBuilder()
		.setCustomId(`openTicketModal_${interaction.values[0]}`)
		.setTitle(modalSettings.name);
	for (const field of modalSettings.modal.fields) {
		let sty = TextInputStyle.Paragraph;
		if (field.type == 'short') {
			sty = TextInputStyle.Short;
		} else if (field.type == 'long') {
			sty = TextInputStyle.Paragraph;
		}
		const com = new TextInputBuilder()
			.setCustomId(field.id)
			.setLabel(field.lable)
			.setStyle(sty);
		if (field.required) {
			com.setRequired(true);
		}
		if (field.defaultValue) {
			com.setValue(field.defaultValue);
		}
		if (field.placeholder) {
			com.setPlaceholder(field.placeholder);
		}
		if (field.minLength) {
			com.setMinLength(field.minLength);
		}
		if (field.maxLength) {
			com.setMaxLength(field.maxLength);
		}
		const x: any = new ActionRowBuilder().addComponents(com);
		modal.addComponents(x);
	}
	return modal;
}

async function openNewTicket(
	interaction: ModalSubmitInteraction | StringSelectMenuInteraction,
	indexOfType: string
) {
	const locales = lib.locales.events.onSelectMenuInteractionjs;
	lib.cache.usersOpeningTicket.set(interaction.user.id, {
		time: lib.unixTimestamp()
	});
	try {
		const preparing = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle(locales.ticketNowInMaking.title)
			.setDescription(locales.ticketNowInMaking.description)
			.setTimestamp();
		if (interaction.message) {
			await interaction.message.edit({
				embeds: [preparing],
				components: []
			});
		} else {
			interaction.reply({ embeds: [preparing], components: [] });
		}
	} catch (e) {
		console.error(e);
	}
	const guildId = await lib.db.get('guildId');
	const guild = await interaction.client.guilds.fetch(guildId);
	const ticketPrefix =
		lib.settings.categories[Number(indexOfType)].channelprefix;
	createChannel(guild, interaction, ticketPrefix);
}

async function sendError(
	interaction: ModalSubmitInteraction | StringSelectMenuInteraction,
	param: { code: number; message: string }
) {
	const locales = lib.locales.events.onSelectMenuInteractionjs;
	switch (param.code) {
		case 500: {
			const embed = new EmbedBuilder()
				.setColor(await lib.db.get('color.default'))
				.setTitle('Blacklist')
				.setDescription(
					'Bili ste blacklistani.\n Torej možnosti odpiranja ticketa nimate!'
				)
				.setTimestamp();
			await interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 501: {
			const embed = new EmbedBuilder()
				.setColor(await lib.db.get('color.default'))
				.setTitle(locales.ticketAlreadyInMakingEmbed.title)
				.setTimestamp();
			await interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 502: {
			const embed = new EmbedBuilder()
				.setColor(await lib.db.get('color.default'))
				.setTitle(locales.ticketAlreadyOpen.title)
				.setTimestamp();
			await interaction.reply({ embeds: [embed], ephemeral: true });
			break;
		}
		case 505: {
			await interaction.reply({
				content: 'NAPAKA. KONTAKTIRAJTE ADMINISTRACIJO',
				ephemeral: true
			});
			break;
		}
		default: {
			await interaction.reply({
				content: 'NAPAKA. KONTAKTIRAJTE ADMINISTRACIJO',
				ephemeral: true
			});
		}
	}
	return;
}

async function checkStatus(
	interaction: StringSelectMenuInteraction | ModalSubmitInteraction
): Promise<{ code: number; message: string }> {
	const blacklist: Array<string> | null = await lib.ticket.get('blacklist');
	if (blacklist!.includes(interaction.user.id)) {
		return { code: 500, message: 'blacklist' };
	}
	if (interaction.channelId) {
		const hasOpenTicket = lib.cache.openTickets.has(interaction.channelId);
		const channelStatus = await lib.ticket.has(interaction.channelId);
		if (!hasOpenTicket) {
			if (!channelStatus) {
				if (lib.cache.usersOpeningTicket.has(interaction.user.id)) {
					return { code: 501, message: 'alreadyMaking' };
				}
				return { code: 200, message: 'success' };
			} else {
				return { code: 502, message: 'open' };
			}
		} else {
			return { code: 502, message: 'open' };
		}
	}
	return { code: 505, message: 'error' };
}

async function createChannel(
	guild: Guild,
	interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
	ticketPrefix: string
) {
	// DEFINITIONS //
	const data = await lib.db.get(guild.id);
	const passedCategory = await guild.channels.fetch(data.categoryId);
	const category = passedCategory as CategoryChannel;
	const username = await lib.hasNewUsername(interaction.user, true, 'user');
	const name = `${ticketPrefix}-${username}`;
	// CREATE CHANNEL //
	try {
		const channel = await category?.children.create({
			name: name,
			type: ChannelType.GuildText
		});
		sendInitial(channel, interaction, ticketPrefix);
	} catch (e) {
		console.error(e);
	}
}

async function sendInitial(
	guildChannel: TextChannel,
	interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
	ticketPrefix: string
) {
	// DEFINITIONS
	const locales = lib.locales.events.onSelectMenuInteractionjs.initialOpening;
	const member = await guildChannel.guild.members.fetch(interaction.user.id);
	const num = await ticketNumberCalculation(interaction, guildChannel);

	// SEND NEW TICKET EMBED IN TICKET CHANNEL //
	const color = await lib.db.get('color.default');
	logInteraction(guildChannel, member, num);
	const embed = new EmbedBuilder()
		.setAuthor({
			name: interaction.user.username,
			iconURL: member.user.displayAvatarURL()
		})
		.setColor(color)
		.setTitle(locales.logEmbed.title.replace('CATEGORY', ticketPrefix))
		.setTimestamp()
		.addFields(
			{
				name: locales.logEmbed.ticketNumber,
				value: `${num}`,
				inline: true
			},
			{
				name: locales.logEmbed.userProfile,
				value: `${member.user}`,
				inline: true
			}
		)
		.setFooter({
			text: locales.logEmbed.footer.text.replace(
				'USERID',
				interaction.user.id
			)
		});
	if (await lib.db.get('vactarCommunityID')) {
		embed.addFields({
			name: locales.logEmbed.vactar,
			value: locales.logEmbed.openHere.replace(
				'LINK',
				`https://app.vactar.io/communities/${await lib.db.get(
					'vactarCommunityID'
				)}/players/identifiers?search=${member.user.id}`
			),
			inline: true
		});
	}
	const select = new ButtonBuilder()
		.setCustomId('closeByOpen')
		.setLabel(locales.button.lable)
		.setStyle(ButtonStyle.Danger);

	const row: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
		select
	);
	// PIN THE MESSAGE //
	try {
		if (interaction instanceof StringSelectMenuInteraction) {
			const mes = await guildChannel.send({
				embeds: [embed],
				components: [row]
			});
			await mes.pin();
			guildChannel.bulkDelete(1);
		} else {
			const mes = await guildChannel.send({ embeds: [embed] });
			await mes.pin();
			guildChannel.bulkDelete(1);
		}
	} catch (e) {
		console.error(e);
	}

	const embed2 = new EmbedBuilder()
		.setColor(color)
		.setTitle(locales.channelEmbed.title)
		.setTimestamp();
	await interaction.reply({ embeds: [embed2] });
	// SEND ALL DATA TO DATABASE //
	databaseSync(interaction, guildChannel, num);

	if (interaction instanceof ModalSubmitInteraction) {
		const indexOfType = interaction.customId.split('_')[1];
		const typeOfHelp = lib.settings.categories[Number(indexOfType)];
		const sendEmbed = new EmbedBuilder()
			.setColor(color)
			.setTitle('Odgovori');

		for (const field of typeOfHelp.modal.fields) {
			const userInput =
				interaction.fields.getTextInputValue(field.id) || 'EMPTY';
			const fieldLable = field.lable;
			sendEmbed.addFields({ name: fieldLable, value: userInput });
		}

		await guildChannel.send({ embeds: [sendEmbed], components: [row] });
	}
}

async function logInteraction(
	x: TextChannel,
	member: GuildMember,
	num: number
) {
	// DEFINITIONS //
	const locales = lib.locales.events.onSelectMenuInteractionjs.initialOpening;
	const data = await lib.db.get(x.guildId);
	const passedChannel = await x.guild.channels.fetch(data.logChannel);
	const channel = passedChannel as TextChannel;
	const wbh = await lib.wbh(channel);

	// EMBEDS //
	const embed = new EmbedBuilder()
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.displayAvatarURL()
		})
		.setColor(await lib.db.get('color.default'))
		.setTitle(
			locales.otherLogEmbed.title.replace(
				'USERNAME',
				member.user.username
			)
		)
		.setTimestamp()
		.addFields(
			{
				name: locales.otherLogEmbed.ticketNumber,
				value: `${num}`,
				inline: true
			},
			{
				name: locales.otherLogEmbed.userProfile,
				value: `${member.user}`,
				inline: true
			}
		)
		.setFooter({ text: locales.otherLogEmbed.footer.text });

	// SEND TO LOG CHANNEL //
	wbh?.send({ embeds: [embed] });
}

async function databaseSync(
	interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
	x: TextChannel,
	num: number
) {
	lib.cache.usersOpeningTicket.delete(interaction.user.id);
	const newTable = lib.db.table(`tt_${num}`);
	await newTable.set('info', {
		guildChannel: x.id,
		dmChannel: [interaction.channelId],
		creatorId: interaction.user.id,
		closed: false
	});
	await lib.ticket.set(x.id, num);
	await lib.ticket.set(interaction.channelId!, num);
	lib.cache.openTickets.set(x.id, { number: num });
	lib.cache.openTickets.set(interaction.channelId!, { number: num });
	await newTable.set('analytics', {
		date: lib.datestamp(),
		time: lib.timestamp(),
		rating: null
	});
	await newTable.set('messageAnalitys', {
		messages: {
			sentByDM: 0,
			sentByServer: 0,
			serverMessagesUsers: [],
			DMMessagesUsers: []
		}
	});
	await newTable.set('activity', {
		lastServerMessage: lib.unixTimestamp(),
		lastDMMessage: lib.unixTimestamp()
	});
	await lib.ticket.push('tickets', num);
	await lib.ticket.push('openTickets', num);
	await lib.thistory.push(interaction.user.id, {
		ticket: num,
		creator: true
	});
}

async function ticketNumberCalculation(
	interaction: StringSelectMenuInteraction | ModalSubmitInteraction,
	x: TextChannel
) {
	let num = await lib.db.get('ticketNumber');
	if (num) {
		await lib.db.set('ticketNumber', num + 1);
	} else {
		num = interaction.channelId + x.id;
		await lib.db.set('ticketNumber', 1);
	}
	return num;
}
