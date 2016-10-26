var WeePromise = require('../compiled/wee-promise');
module.exports = {
	resolved: function(value) {
		return new WeePromise(function(resolve) {
			resolve(value);
		});
	},
	rejected: function(reason) {
		return new WeePromise(function(resolve, reject) {
			reject(reason);
		});
	},
	deferred: function() {
		var $resolve,
			$reject,
			promise = new WeePromise(function(resolve, reject) {
				$resolve = resolve;
				$reject = reject;
			});
		return {
			promise: promise,
			resolve: $resolve,
			reject: $reject
		};
	}
};
