// Import necessary modules and libraries
import { jsonc } from 'jsonc';
import fs from 'fs';
import path from 'path';

// Import interfaces
import * as cacheI from '../interfaces/cache';
import settingsI from '../interfaces/settings';

// Parse locales from JSONC file
const locales: any = jsonc.parse(
	fs.readFileSync(path.join(__dirname, '../locales/locales.jsonc'), 'utf8')
);

// Import database instance
import database from '../index';

// Define ticket and ticket history tables
const ticket = database.table('ticket');
const thistory = database.table('thistory');

// Parse settings from JSONC file
const settings: settingsI = jsonc.parse(
	fs.readFileSync(path.join(__dirname, '../config/settings.jsonc'), 'utf8')
);

// Import version from package.json
import { version } from '../package.json';

// Import utility functions
import close from '../utils/close';
import newTicket from '../utils/openTicket';
import {
	getDatestamp,
	getTimestamp,
	hasNewUsername,
	unixTimestamp
} from '../utils/etc';
import { webhook } from '../utils/webhook';

// Initialize cache maps
const userRanks = new Map<string, cacheI.userRanksI>();
const usersOpeningTicket = new Map<string, cacheI.usersOpeningTicketI>();
const closingTickets = new Map<number, cacheI.closingTicketsI>();
const openTickets = new Map<string, cacheI.openTicketsI>();

// Combine cache maps into a single cache object
const cache: cacheI.cacheI = {
	userRanks: userRanks,
	usersOpeningTicket: usersOpeningTicket,
	closingTickets: closingTickets,
	openTickets: openTickets
};

// Define a test function for testing purposes
const test = function(): boolean {
	return true;
};

// Combine all imports, settings, and functions into a single library object
const lib = {
	locales: locales,
	db: database,
	ticket: ticket,
	thistory: thistory,
	settings: settings,
	version: version,
	// FUNCTIONS //
	close: close,
	newTicket: newTicket,
	hasNewUsername: hasNewUsername,
	unixTimestamp: unixTimestamp,
	timestamp: getTimestamp,
	datestamp: getDatestamp,
	wbh: webhook,
	// CACHE //
	cache: cache,
	// TEST FUNCTION//
	test: test
};

// Export the library object as the default export
export default lib;
