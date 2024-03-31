// DEFINITIONS
import { jsonc } from 'jsonc';
import fs from 'fs';
import path from 'path';

// INTERFACES //
import * as cacheI from '../interfaces/cache';
import settingsI from '../interfaces/settings';

// LOCALES DEFINITION //
const locales: any = jsonc.parse(
	fs.readFileSync(path.join(__dirname, '../locales/locales.jsonc'), 'utf8')
);
// DATABASE DEFINITION //
import database from '../index';
// TICKET TABLE DEFINITION //
const ticket = database.table('ticket');
// SETTINGS DEFINITION //
const settings: settingsI = jsonc.parse(
	fs.readFileSync(path.join(__dirname, '../config/settings.jsonc'), 'utf8')
);
// VERSION //
import { version } from '../package.json';

// FUNCTIONS //
import close from '../utils/close';
import newTicket from '../utils/openTicket';
import {
	getDatestamp,
	getTimestamp,
	hasNewUsername,
	unixTimestamp
} from '../utils/etc';
import { webhook } from '../utils/webhook';

// CACHE //
const userRanks = new Map<string, cacheI.userRanksI>();
const usersOpeningTicket = new Map<string, cacheI.usersOpeningTicketI>();
const closingTickets = new Map<number, cacheI.closingTicketsI>();
const openTickets = new Map<string, cacheI.openTicketsI>();
const cache: cacheI.cacheI = {
	userRanks: userRanks,
	usersOpeningTicket: usersOpeningTicket,
	closingTickets: closingTickets,
	openTickets: openTickets
};

// TESTING FEATURE //
// eslint-disable-next-line space-before-function-paren
const test = function (): boolean {
	return true;
};

const lib = {
	locales: locales,
	db: database,
	ticket: ticket,
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
// EXPORT
export default lib;
