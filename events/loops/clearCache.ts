import { Events, Client } from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
		setInterval(clearCache, 3600000);
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

function clearCache() {
	lib.cache.userRanks.clear();
}

async function checkCache(cache: any, serverTms: number) {
	for (const pair of cache) {
		const [key, value] = pair;
		const time = value.time;
		const cal = serverTms - time;
		if (cal >= 10000) {
			console.log('Deleting');
			cache.delete(key);
		}
	}
}