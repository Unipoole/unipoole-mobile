'use strict';

/* Services */

/**
 * Service that will handle registrations of modules.
 * This service interacts with SyncAPI to talk with external services,
 * and with DataService for writing files.
 */
synthMobile.factory('RegisterService',
	['$q', '$filter', 'DataService', 'SyncAPIService','LoggerService','SynthFail','SynthCheckResponseError','SynthQLoop',
	 function($q, $filter, DataService, SyncAPIService, LoggerService, _SF,CheckError, SynthQLoop){

		// A reference to a logger for this service
		var LOG = LoggerService('RegisterService');
		
		/**
		 * Constructor
		 */
		function RegisterService(){
		}
	
		/**
		 * Initialises the application to use the specified array of modules
		 */
		RegisterService.prototype.initModules = function(modules){
			LOG.debug('initModules()');
			var service = this;
			/*
			 * Function that will return a promise if there are more modules 
			 * to create
			 */
			var cIdx = 0;
			function getCreateModulePromise(){
				
				// If there are no more modules return null
				if(cIdx == modules.length) return null;
				
				// Else return a promise to create the module structure
				return service._createModuleStructure(modules[cIdx++].id);
			}
			
			return SynthQLoop(getCreateModulePromise);
		};
		
		/**
		 * Function to register for all modules in an array
		 */
		RegisterService.prototype.registerModules = function(modules){
			/*
			 * Returns a promise to register a module
			 */
			var mIdx = 0;
			function getRegisterPromise(){
				
				// If there are no more modules return null
				if(mIdx == modules.length) return null;
				
				var module=modules[mIdx++];
				return SyncAPIService
					// register for the module
					.registerForModule(module.id)
					// Save the registration data
					.then(function(response){
						var userData = {
							'lmsId' : response.userDetails['lms-id'],
							'displayName' : response.userDetails['display-name']
						};
						return DataService.mergeToRegistrationData(userData);
					})
					// Update the module data
					.then(function(){
						return SyncAPIService.updateModuleData(module.id);
					});
			}
			
			// Start registering all modules
			return SynthQLoop(getRegisterPromise);
		};
	
		
		
		/**
		 * Create the file structure for a module
		 */
		RegisterService.prototype._createModuleStructure = function(moduleId){
			var tools;
			var self = this;
			/*
			 * Returns a promise to create the directories for a tool
			 */
			var tIdx = 0;
			function getCreateToolPromise(){
				
				// If there are no more modules return null
				if(tIdx == tools.length) return null;
				
				var tool = tools[tIdx++];
				return self._createToolDataFile(moduleId, tool.id);
			}
			
			/*
			 * Returns a promise to get the tools, and sets 
			 * the tools variable
			 */
			function getModuleToolsPromise(){
				return self._getModuleTools(moduleId)
					.then(function(moduleTools){
						tools=moduleTools;
					});
			}
			
			return this._createModuleDataFile(moduleId)
				.then(getModuleToolsPromise)
				.then(SynthQLoop(getCreateToolPromise));
		};
		
		/**
		 * Create the file structure for a module
		 */
		RegisterService.prototype._createModuleDataFile = function(moduleId){
			return DataService.copyFromWebToFile("base/data/module.json", moduleId, "module.json");
		};
		
		/**
		 * Create the data file for a tool
		 */
		RegisterService.prototype._createToolDataFile = function(moduleId, toolId){
			return DataService.writeToFile(moduleId + "/tools/" + toolId + "/data", toolId + ".json", "{}");
		};
		
		/**
		 * Get the tools used for the module
		 */
		RegisterService.prototype._getModuleTools = function(moduleId){
			var deferred = $q.defer();
			DataService.getModuleData(moduleId).then(
				// Success
				function(data){
					var tools = $filter("object2Array")(data.toolsLocal);
					LOG.isDEBUG() && LOG.debug("Got module tools : " + JSON.stringify(tools));
					deferred.resolve(tools);
				},
				// Failed
				function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		};
	
		return new RegisterService();
}]);
