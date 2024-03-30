import { Events } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute() {
		setInterval(clearCache, 3600000);
		setInterval(handleOpenTickets, 600000);
		setInterval(() => {
			clearCaches();
		}, 2000);
	},
};

async function clearCaches() {
	const serverTms = lib.unixTimestamp();
	const usersCache = lib.cache.usersOpeningTicket;
	const closingTickets = lib.cache.closingTickets;

	checkCache(usersCache, serverTms);
	checkCache(closingTickets, serverTms);
}

async function handleOpenTickets() {
	const blacklistedIds = [
		'blacklist',
		'users',
		'tickets',
		'openTickets',
		'inaQueue',
		'closing',
	];
	const cache = lib.cache.openTickets;
	cache.clear();

	const allTickets = await lib.ticket.all();
	for (const { id, value } of allTickets) {
		if (blacklistedIds.includes(id)) continue;
		cache.set(id, { number: value });
	}
}

function clearCache() {
	lib.cache.userRanks.clear();
}

async function checkCache(cache: any, serverTms: number) {
	for (const pair of cache) {
		const [key, value] = pair;
		const time = value.time;
		const cal = serverTms - time;
		if (cal >= 10000) {
			cache.delete(key);
		}
	}
}
