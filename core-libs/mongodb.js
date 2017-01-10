"use strict";

const modb = require('mongoose'),
			fs   = require("fs"),
			path = require("path"),
			_ = require('lodash');

/**
 * MongoDB module
 *
 * @return     {Object}  MongoDB wrapper instance
 */
module.exports = {

	/**
	 * Initialize DB
	 *
	 * @return     {Object}  DB instance
	 */
	init() {

		let self = this;
		global.Mongoose = modb;

		let dbModelsPath = path.resolve(ROOTPATH, 'models');

		modb.Promise = require('bluebird');

		// Event handlers

		modb.connection.on('error', (err) => {
			winston.error('Failed to connect to MongoDB instance.');
		});
		modb.connection.once('open', function() {
			winston.log('Connected to MongoDB instance.');
		});

		// Store connection handle

		self.connection = modb.connection;
		self.ObjectId = modb.Types.ObjectId;

		// Load DB Models

		fs
		.readdirSync(dbModelsPath)
		.filter(function(file) {
			return (file.indexOf(".") !== 0);
		})
		.forEach(function(file) {
			let modelName = _.upperFirst(_.camelCase(_.split(file,'.')[0]));
			self[modelName] = require(path.join(dbModelsPath, file));
		});

		// Connect

		self.onReady = modb.connect(appconfig.db);

		return self;

	}

};
