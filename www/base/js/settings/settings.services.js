/* 
 * base/js/settings/settings.controllers.js
 */
(function(synthMobile){
'use strict';
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

		return new SettingsService();
	}
]);
})(synthMobile);