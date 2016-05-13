'use strict';

/* Services */


/**
 * Factory for the Settings Service
 */
synthMobile.factory('SettingsService',
	['$q', '$filter', 'DataService', 'LoggerService','UserSession',
	 function($q, $filter, DataService, LoggerService, UserSession){
		var LOG = LoggerService("SettingsService");
		/**
		 * Constructor
		 */
		function SettingsService(){
		}
	
		
		SettingsService.prototype.doX = function(){
			var deferred = $q.defer();
			
			deferred.resolve();
			
			return deferred.promise;
		};
	
		return new SettingsService();
	}
]);
