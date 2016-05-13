'use strict';

/* Services */

/**
 * Create factory for the welcome Service
 */
synthMobile.factory('WelcomeService',
	['$q', 'DataService', 'UserSession', 'LoggerService',
	function($q, DataService, UserSession, LoggerService) {
		var LOG = LoggerService('WelcomeService');
		
		/**
		 * Creates a new instance of the WelcomeService
		 */
		function WelcomeService() {
		}

		/**
		 * Gets the welcome data
		 */
		WelcomeService.prototype.getWelcome = function() {
			var deferred = $q.defer();
			// Get the tool data
			DataService.getToolData(UserSession.activeModule, "welcome").then(
			// Success
			function(data) {
				deferred.resolve(data);
			},
			// Failed
			function(){
				LOG.warn("Service failed to get welcome");
				deferred.reject();
			});
			return deferred.promise;
		};

		return new WelcomeService();
	}
]);
