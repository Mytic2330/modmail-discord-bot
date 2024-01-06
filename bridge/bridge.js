// DEFINITIONS
const close = require('../utils/close');
const newTicket = require('../utils/openTicket');

// LINKING UTILITY
/**
 * @typedef {object} Lib
 * @property {function} newTicket
 * @property {function} close
 */
const lib = {};

/**
 * Close a ticket
 * @param {Base} base Interaction or client
 * @param {string} type Close (cls) or Inactive (ina)
 * @param {?number} ticketNumber
 */
lib.close = function(base, type, ticketNumber) {
	close(base, type, ticketNumber);
};
/**
 * Open a ticket
 * @param {Base} base Default: Message || Can be button
 */
lib.newTicket = function(base) {
	newTicket(base);
};

// EXPORT
module.exports = { lib };