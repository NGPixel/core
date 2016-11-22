"use strict";

/**
 * Alerts
 */
class Alerts {

	/**
	 * Constructor
	 *
	 * @class
	 */
	constructor() {

		let self = this;

		self.mdl = new Vue({
			el: '#alerts',
			data: {
				children: []
			},
			methods: {
				acknowledge: (uid) => {
					self.close(uid);
				}
			}
		});

		self.uidNext = 1;

	}

	/**
	 * Show a new Alert
	 *
	 * @param      {Object}  options  Alert properties
	 * @return     {null}  Void
	 */
	push(options) {

		let self = this;

		let nAlert = _.defaults(options, {
			_uid: self.uidNext,
			class: 'info',
			iconClass: 'fa-info',
			message: '---',
			sticky: false,
			title: '---'
		});

		self.mdl.children.push(nAlert);

		if(!nAlert.sticky) {
			_.delay(() => {
				self.close(nAlert._uid);
			}, 5000);
		}

		self.uidNext++;

	}

	/**
	 * Shorthand method for pushing errors
	 *
	 * @param      {String}  title    The title
	 * @param      {String}  message  The message
	 */
	pushError(title, message) {
		this.push({
			class: 'error',
			iconClass: 'fa-warning',
			message,
			sticky: false,
			title
		});
	}

	/**
	 * Shorthand method for pushing success messages
	 *
	 * @param      {String}  title    The title
	 * @param      {String}  message  The message
	 */
	pushSuccess(title, message) {
		this.push({
			class: 'success',
			iconClass: 'fa-check',
			message,
			sticky: false,
			title
		});
	}

	/**
	 * Close an alert
	 *
	 * @param      {Integer}  uid     The unique ID of the alert
	 */
	close(uid) {

		let self = this;

		let nAlertIdx = _.findIndex(self.mdl.children, ['_uid', uid]);
		let nAlert = _.nth(self.mdl.children, nAlertIdx);

		if(nAlertIdx >= 0 && nAlert) {
			nAlert.class += ' exit';
			self.mdl.children.$set(nAlertIdx, nAlert);
			_.delay(() => {
				self.mdl.children.$remove(nAlert);
			}, 500);
		}

	}

}