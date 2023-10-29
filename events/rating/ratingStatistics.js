const { Events } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;
		const ch_cd11 = interaction.customId.startsWith('stat');
		if (!ch_cd11) return;
		switchCheck(interaction);
	},
};

async function switchCheck(interaction) {
	const id_inter = interaction.customId.split('_');
	switch (id_inter[1]) {
	case 'rating':
		rateFnc(interaction);
		break;
	case 'ticket':
		// ticketFnc(interaction);
		break;
	}
}

async function rateFnc(interaction) {
	const client = interaction.client;
	const all_tickets = await client.ticket.get('tickets');
	const arr = [];

	for (const ticket of all_tickets) {
		const data = await getRatingInfo(ticket, client);
		if (data != undefined) arr.push(data);
	}

}

async function getRatingInfo(tc_id, client) {
	const analytics = await client.db.table(`tt_${tc_id}`).get('analytics');
	const messageAnalitys = await client.db.table(`tt_${tc_id}`).get('messageAnalitys');
	const info = await client.db.table(`tt_${tc_id}`).get('info');
	const isClosed = info.closed;
	if (isClosed === false) return undefined;
	const returnData = { 'analytics': analytics, 'messageAnalitys': messageAnalitys };
	return returnData;
}