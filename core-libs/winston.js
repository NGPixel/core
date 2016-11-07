"use strict";

var winston = require('winston');

module.exports = (isDebug) => {

	if(typeof PROCNAME === undefined) {
		const PROCNAME = 'SERVER';
	}

	winston.remove(winston.transports.Console);
	winston.add(winston.transports.Console, {
		level: (isDebug) ? 'debug' : 'info',
		prettyPrint: true,
		colorize: true,
		silent: false,
		timestamp: true,
		filters: [(level, msg, meta) => {
			return '[' + PROCNAME + '] ' + msg;
		}]
	});

	return winston;

};
