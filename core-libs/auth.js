'use strict'

/* global appconfig, appdata, db, winston */

const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const WindowsLiveStrategy = require('passport-windowslive').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const SlackStrategy = require('passport-slack').Strategy
const LDAPStrategy = require('passport-ldapauth').Strategy

module.exports = function (passport) {
  // Serialization user methods

  passport.serializeUser(function (user, done) {
    done(null, user._id)
  })

  passport.deserializeUser(function (id, done) {
    db.User.findById(id).then((user) => {
      if (user) {
        done(null, user)
      } else {
        done(new Error('User not found.'), null)
      }
      return true
    }).catch((err) => {
      done(err, null)
    })
  })

  // Local Account

  if (!appdata.capabilities.manyAuthProviders || appconfig.auth.local && appconfig.auth.local.enabled) {
    passport.use('local',
      new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },
      (uEmail, uPassword, done) => {
        db.User.findOne({ email: uEmail, provider: 'local' }).then((user) => {
          if (user) {
            return user.validatePassword(uPassword).then(() => {
              return done(null, user) || true
            }).catch((err) => {
              return done(err, null)
            })
          } else {
            return done(new Error('Invalid Login'), null)
          }
        }).catch((err) => {
          done(err, null)
        })
      }
    ))
  }

  // Google ID

  if (appdata.capabilities.manyAuthProviders && appconfig.auth.google && appconfig.auth.google.enabled) {
    passport.use('google',
      new GoogleStrategy({
        clientID: appconfig.auth.google.clientId,
        clientSecret: appconfig.auth.google.clientSecret,
        callbackURL: appconfig.host + '/login/google/callback'
      },
      (accessToken, refreshToken, profile, cb) => {
        db.User.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
    ))
  }

  // Microsoft Accounts

  if (appdata.capabilities.manyAuthProviders && appconfig.auth.microsoft && appconfig.auth.microsoft.enabled) {
    passport.use('windowslive',
      new WindowsLiveStrategy({
        clientID: appconfig.auth.microsoft.clientId,
        clientSecret: appconfig.auth.microsoft.clientSecret,
        callbackURL: appconfig.host + '/login/ms/callback'
      },
      function (accessToken, refreshToken, profile, cb) {
        db.User.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
    ))
  }

  // Facebook

  if (appdata.capabilities.manyAuthProviders && appconfig.auth.facebook && appconfig.auth.facebook.enabled) {
    passport.use('facebook',
      new FacebookStrategy({
        clientID: appconfig.auth.facebook.clientId,
        clientSecret: appconfig.auth.facebook.clientSecret,
        callbackURL: appconfig.host + '/login/facebook/callback',
        profileFields: ['id', 'displayName', 'email']
      },
      function (accessToken, refreshToken, profile, cb) {
        db.User.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
    ))
  }

  // GitHub

  if (appdata.capabilities.manyAuthProviders && appconfig.auth.github && appconfig.auth.github.enabled) {
    passport.use('github',
      new GitHubStrategy({
        clientID: appconfig.auth.github.clientId,
        clientSecret: appconfig.auth.github.clientSecret,
        callbackURL: appconfig.host + '/login/github/callback',
        scope: [ 'user:email' ]
      },
      (accessToken, refreshToken, profile, cb) => {
        db.User.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
    ))
  }

  // Slack

  if (appdata.capabilities.manyAuthProviders && appconfig.auth.slack && appconfig.auth.slack.enabled) {
    passport.use('slack',
      new SlackStrategy({
        clientID: appconfig.auth.slack.clientId,
        clientSecret: appconfig.auth.slack.clientSecret,
        callbackURL: appconfig.host + '/login/slack/callback'
      },
      (accessToken, refreshToken, profile, cb) => {
        db.User.processProfile(profile).then((user) => {
          return cb(null, user) || true
        }).catch((err) => {
          return cb(err, null) || true
        })
      }
    ))
  }

  // Create users for first-time

  db.onReady.then(() => {
    db.User.count().then((c) => {
      if (c < 1) {
        // Create root admin account

        winston.info('[AUTH] No administrator account found. Creating a new one...')
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
          })
        }).then(() => {
          winston.info('[AUTH] Administrator account created successfully!')
        }).then(() => {
          if (appdata.capabilities.guest) {
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
            }).then(() => {
              winston.info('[AUTH] Guest account created successfully!')
            })
          } else {
            return true
          }
        }).catch((err) => {
          winston.error('[AUTH] An error occured while creating administrator/guest account:')
          winston.error(err)
        })
      }
    })

    return true
  })
}
