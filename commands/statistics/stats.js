const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
		.setDescription('Preveri statistike'),
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setTitle('Pregled statistik')
			.setDescription('Izberite kategorijo statistike, ki si jo želite ogledati:')
			.setColor('Random')
			.addFields(
				{ name: '\u200B', value: '\u200B' },
				{ name: '⭐', value: 'Statistični vpogled v \nzadovoljstvo uporabnikov pri ticketih' },
				{ name: '📋', value: 'Statistični vpogled v \npodatke iz ticketa vaše izbere' },
			);
		const ratingButton = new ButtonBuilder()
			.setCustomId('stat_rating')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('⭐');
		const selectTicket = new ButtonBuilder()
			.setCustomId('stat_ticket')
			.setStyle(ButtonStyle.Primary)
			.setEmoji('📋');
		const row = new ActionRowBuilder()
			.addComponents(ratingButton)
			.addComponents(selectTicket);
		interaction.reply({ embeds: [embed], components: [row] });
	},
};