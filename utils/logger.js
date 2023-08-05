const fs = require('fs');
const path = require('path');
const util = require('util');

const logDirectory = path.join(__dirname, '../logs');
let currentLogFile = getCurrentLogFile();
let logStream = createLogStream(currentLogFile);

const originalConsoleLog = console.log;

console.log = function(message, ...args) {
	const timestamp = getTimestamp();
	const logMessage = `[${timestamp}] ${util.format(message, ...args)}\n`;

	const isWriteStreamFull = !logStream.write(logMessage);
	if (isWriteStreamFull) {
		logStream.once('drain', () => {
			originalConsoleLog(message, ...args);
		});
	}
	else {
		originalConsoleLog(message, ...args);
	}

	if (!isSameHour(currentLogFile)) {
		logStream.end();
		currentLogFile = getCurrentLogFile();
		logStream = createLogStream(currentLogFile);
	}
};

function getTimestamp() {
	const date = new Date();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

function createLogStream(logFile) {
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

function isSameHour(logFile) {
	if (!fs.existsSync(logFile)) {
		return false;
	}

	const fileHour = logFile.slice(-7, -4);
	const currentHour = String(new Date().getHours()).padStart(2, '0');

	return fileHour === currentHour;
}

module.exports = logStream;
