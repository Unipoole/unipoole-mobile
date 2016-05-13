'use strict';

/* Services */

/**
 * Service for the home screen
 */
synthMobile.factory('HomeService',
	['$q', '$filter', 'DataService', 'LoggerService','UserSession','SynthFail',
	 function($q, $filter, DataService, LoggerService, UserSession, _SF){
		var LOG = LoggerService("HomeService");
		/**
		 * Constructor
		 */
		function HomeService(){
		}
	
		/**
		 * Gets the tools to display on the home screen
		 */
		HomeService.prototype.getHomeTools = function(){
			var deferred = $q.defer();
			DataService.getModuleData(UserSession.activeModule).then(
			// Success
			function(config){
				var tools = config.toolDescriptions;
				var availableTools = $filter('object2Array')(tools);
				availableTools = $filter('filter')(availableTools, {menu : true});
				availableTools = $filter('orderBy')(availableTools, 'seq');
				deferred.resolve(availableTools);
			},_SF(deferred));
			return deferred.promise;
		};
	
		return new HomeService();
	}
]);
