/* eslint-disable no-inline-comments */
import express, { Request, Response } from 'express';
import lib from '../bridge/bridge';

const requiredCryptoKey = '123';
const app = express();

app.get('/api/auth/authorizeKey', (req, res) => {
	const head = req.headers;
	if (head.bytecode) {
		if (head.bytecode === 'authKeyToken') {
			res.send(requiredCryptoKey); // Sends the required crypto key if the bytecode matches
			return;
		}
	}
	res.sendStatus(401); // Sends a 401 status if the bytecode does not match
});

app.get('/api/basic/settings', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	res.send(lib.settings); // Sends the settings if authorized
});

app.get('/api/database/getallSettings', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	res.send(await lib.db.all()); // Sends all settings from the database if authorized
});

app.get('/api/database/getAllTicketData', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	res.send(await lib.ticket.all()); // Sends all ticket data from the database if authorized
});

app.get('/api/database/getTicketData', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	const ticketNumber = req.headers.ticketnumber;
	if (!ticketNumber) {
		res.sendStatus(400); // Sends a 400 status if the ticket number is not provided
		return;
	}
	res.send(await lib.ticket.table(`tt_${ticketNumber}`).all()); // Sends the ticket data for the specified ticket number if authorized
});

export default function startServer() {
	app.listen(2559); // Starts the server on port 2559
}

async function authCheck(req: Request, res: Response): Promise<boolean> {
	if (!req.headers.authorization) {
		res.sendStatus(401); // Sends a 401 status if the authorization header is not provided
		return false;
	}
	if (req.headers.authorization !== requiredCryptoKey) {
		res.sendStatus(401); // Sends a 401 status if the authorization header does not match the required crypto key
		return false;
	}
	return true; // Returns true if authorized
}
