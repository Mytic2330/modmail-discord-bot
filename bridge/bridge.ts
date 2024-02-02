// DEFINITIONS
import { jsonc } from 'jsonc';
import fs from 'fs';
import path from 'path';

// LOCALES DEFINITION //
const locales: any = jsonc.parse(
	fs.readFileSync(path.join(__dirname, '../locales/locales.jsonc'), 'utf8'),
);
// DATABASE DEFINITION //
import database from '../index';
// TICKET TABLE DEFINITION //
const ticket = database.table('ticket');
// SETTINGS DEFINITION //
const settings: any = jsonc.parse(
	fs.readFileSync(path.join(__dirname, '../config/settings.jsonc'), 'utf8'),
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
	unixTimestamp,
} from '../utils/etc';
import { webhook } from '../utils/webhook';

// CACHE //
const userRanks = new Map<string, { username: string; rank: string }>();
const usersOpeningTicket = new Map<string, { time: number }>();
const closingTickets = new Map<number, { time: number }>();
const cache = {
	userRanks: userRanks,
	usersOpeningTicket: usersOpeningTicket,
	closingTickets: closingTickets,
};

// TESTING FEATURE //
const test = function(): boolean {
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
	test: test,
};
// EXPORT
export default lib;
