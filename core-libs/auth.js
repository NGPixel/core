"use strict";

const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const WindowsLiveStrategy = require('passport-windowslive').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const _ = require('lodash');

module.exports = function(passport, appconfig) {

	// Serialization user methods

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		db.User.findById(id).then((user) => {
			if(user) {
				done(null, user);
			} else {
				done(new Error('User not found.'), null);
			}
			return true;
		}).catch((err) => {
			done(err, null);
		});
	});

	// Local Account

	if(appconfig.auth.local && appconfig.auth.local.enabled) {

		passport.use('local',
			new LocalStrategy({
				usernameField : 'email',
				passwordField : 'password'
			},
			(uEmail, uPassword, done) => {
				db.User.findOne({ email: uEmail, provider: 'local' }).then((user) => {
					if(user) {
						return user.validatePassword(uPassword).then(() => {
							return done(null, user) || true;
						}).catch((err) => {
							 return done(err, null);
						});
					} else {
						return done(new Error('Invalid Login'), null);
					}
				}).catch((err) => {
					done(err, null) ;
				});
			}
		));

	}

	// Google ID

	if(appconfig.auth.google && appconfig.auth.google.enabled) {

		passport.use('google',
			new GoogleStrategy({
				clientID: appconfig.auth.google.clientId,
				clientSecret: appconfig.auth.google.clientSecret,
				callbackURL: appconfig.host + '/login/google/callback'
		  },
		  (accessToken, refreshToken, profile, cb) => {
		  	db.User.processProfile(profile).then((user) => {
		  		return cb(null, user) || true;
		  	}).catch((err) => {
		  		return cb(err, null) || true;
		  	});
		  }
		));

	}

	// Microsoft Accounts

	if(appconfig.auth.microsoft && appconfig.auth.microsoft.enabled) {

		passport.use('windowslive',
			new WindowsLiveStrategy({
				clientID: appconfig.auth.microsoft.clientId,
				clientSecret: appconfig.auth.microsoft.clientSecret,
				callbackURL: appconfig.host + '/login/ms/callback'
		  },
		  function(accessToken, refreshToken, profile, cb) {
		  	db.User.processProfile(profile).then((user) => {
		  		return cb(null, user) || true;
		  	}).catch((err) => {
		  		return cb(err, null) || true;
		  	});
		  }
		));

	}

	// Facebook

	if(appconfig.auth.facebook && appconfig.auth.facebook.enabled) {

		passport.use('facebook',
			new FacebookStrategy({
				clientID: appconfig.auth.facebook.clientId,
				clientSecret: appconfig.auth.facebook.clientSecret,
				callbackURL: appconfig.host + '/login/facebook/callback',
				profileFields: ['id', 'displayName', 'email']
		  },
		  function(accessToken, refreshToken, profile, cb) {
		  	db.User.processProfile(profile).then((user) => {
		  		return cb(null, user) || true;
		  	}).catch((err) => {
		  		return cb(err, null) || true;
		  	});
		  }
		));

	}

	// Create users for first-time

	db.onReady.then(() => {

		db.User.count().then((c) => {
			if(c < 1) {

				// Create root admin account

				winston.info('[AUTH] No administrator account found. Creating a new one...');
				db.User.hashPassword('admin123').then((pwd) => {
					return db.User.create({
						provider: 'local',
						email: appconfig.admin,
						name: 'Administrator',
						password: pwd,
						rights: [{
							role: 'admin',
							path: '/',
							exact: false,
							deny: false
						}]
					});

				}).then(() => {
					winston.info('[AUTH] Administrator account created successfully!');
				}).then(() => {

					// Create guest account

					return db.User.create({
						provider: 'local',
						email: 'guest',
						name: 'Guest',
						password: '',
						rights: [{
							role: 'read',
							path: '/',
							exact: false,
							deny: !appconfig.public
						}]
					});

				}).then(() => {
					winston.info('[AUTH] Guest account created successfully!');
				}).catch((err) => {
					winston.error('[AUTH] An error occured while creating administrator/guest account:');
					winston.error(err);
				});
			}
		});

		return true;

	});

};
