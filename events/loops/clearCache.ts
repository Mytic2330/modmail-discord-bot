import { Events } from 'discord.js';
import lib from '../../bridge/bridge';

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute() {
		// Set intervals to clear cache and handle open tickets
		setInterval(clearCache, 3600000);
		setInterval(handleOpenTickets, 600000);
		setInterval(() => {
			clearCaches();
		}, 2000);
	}
};

async function clearCaches() {
	const serverTms = lib.unixTimestamp();
	const usersCache = lib.cache.usersOpeningTicket;
	const closingTickets = lib.cache.closingTickets;

	// Check and clear expired cache entries
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
		'closing'
	];
	const cache = lib.cache.openTickets;
	cache.clear();

	// Fetch all tickets and update the cache
	const allTickets = await lib.ticket.all();
	for (const { id, value } of allTickets) {
		if (blacklistedIds.includes(id)) continue;
		cache.set(id, { number: value });
	}
}

function clearCache() {
	// Clear user ranks cache
	lib.cache.userRanks.clear();
}

async function checkCache(cache: any, serverTms: number) {
	for (const pair of cache) {
		const [key, value] = pair;
		const time = value.time;
		const cal = serverTms - time;
		// Remove cache entries older than 10 seconds
		if (cal >= 10000) {
			cache.delete(key);
		}
	}
}
