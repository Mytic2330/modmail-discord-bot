/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { Writable } from 'stream';

const logDirectory = path.join(__dirname, '../logs');
let currentLogFile = getCurrentLogFile();
let logStreams = createLogStreams();

const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleInfo = console.info;

console.log = createConsoleLog(originalConsoleLog, 'log');
console.warn = createConsoleLog(originalConsoleWarn, 'warn');
console.error = createConsoleLog(originalConsoleError, 'error');
console.info = createConsoleLog(originalConsoleInfo, 'info');

function createConsoleLog(
	originalFunction: (message?: any, ...optionalParams: any[]) => void,
	type: string,
) {
	return function(message?: any, ...args: any[]) {
		const timestamp = getTimestamp();
		const logMessage = `[${type.toUpperCase()}][${timestamp}] ${util.format(
			message,
			...args,
		)}\n`;

		const logStream = logStreams[type];

		const isWriteStreamFull = !logStream.write(logMessage);
		if (isWriteStreamFull) {
			logStream.once('drain', () => {
				originalFunction(message, ...args);
			});
		}
		else {
			originalFunction(message, ...args);
		}

		if (!isSameHour(currentLogFile)) {
			logStream.end();
			currentLogFile = getCurrentLogFile();
			logStreams = createLogStreams();
		}
	};
}

function createLogStreams() {
	const streams: Record<string, Writable> = {};
	['log', 'warn', 'error', 'info'].forEach((type) => {
		const logFile = getCurrentLogFile();
		const logStream = createLogStream(logFile);
		streams[type] = logStream;
	});
	return streams;
}

function getTimestamp() {
	const date = new Date();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

function createLogStream(logFile: string) {
	const logFilePath = path.join(logDirectory, logFile);

	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory);
	}

	return fs.createWriteStream(logFilePath, { flags: 'a' });
}

function getCurrentLogFile() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}.log.txt`;
}

function isSameHour(logFile: string) {
	if (!fs.existsSync(logFile)) {
		return false;
	}

	const fileHour = logFile.slice(-7, -4);
	const currentHour = String(new Date().getHours()).padStart(2, '0');

	return fileHour === currentHour;
}

export = logStreams['log'];
