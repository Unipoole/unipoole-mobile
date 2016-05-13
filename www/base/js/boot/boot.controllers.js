/* 
 * base/js/boot/boot.controllers.js
 */
'use strict';
(function(synthMobile){
	/**
	 * Controller for the boot up procedure
	 */
	synthMobile.controller('BootCtrl', 
		['$rootScope', '$window','$routeParams','DataService', 'UserService','UserSession', 'SyncAPIService', 'SynthErrorHandler','SyncService',
		function($rootScope, $window, $routeParams, DataService, UserService, UserSession, SyncAPIService, SynthErrorHandler, SyncService) {
		
		$rootScope.activePage="boot";
		
		UserSession.registered = false;
		var status = [];
		$rootScope.status = status;
		$rootScope.applicationBoot=true;
		
		var moduleId = $routeParams.moduleId;
		
		status.push("Initialising...");
		
		if(moduleId != null){
			status.push("Loading module : " + moduleId);
			$rootScope.tools = null; // Make sure to clear possible tool list
		}
		
		// Check that the user settings file exists
		var funcCheckSettings = function(){
			status.push("Checking settings...");
			return DataService.ensureSettingsData().then(function(settings){
				UserSession.updateSession({
					'settings' : settings
				});
			});
		},
		// Make sure there is a no media scan file in place
		funcCheckNoMediaFile = function(){
			return DataService.ensureNoMediaScanFiles();
		},
		
		// Update the current sync status
		funcUpdateSyncStatus = function(){
			status.push("Checking sync status...");
			return SyncAPIService.getSyncStatusOffline(UserSession.activeModule);
		},
		// Check if the user is registered
		funcCheckRegistrationProgress = function(){
			status.push("Checking registration progress...");
			return UserService.getRegistrationProgress();
		},
		// Populate the User session
		funcPopulateUserSession = function(){
			status.push("Loading registration...");
			return DataService.getRegistrationData().then(function(registrationData){
				UserSession.updateSession(registrationData);
				if(moduleId != null){
					UserSession.activeModule=moduleId;
				}
				else{
					UserSession.activeModule=registrationData.defaultModule;
				}
				
			});
		},
		funcGetProgressPromise = function(progress){
			if(UserService.PROGRESS_COMPLETED === progress){
				
				// If the user is registered we will start the background sync
				SyncService.startBackgroundSync();
				UserSession.registered = true;
				return funcUpdateSyncStatus()
				.then(function(){
					$window.location="#/home";
					$rootScope.applicationBoot=false;
				});
			}
			else if(UserService.PROGRESS_SELECT_MODULES === progress){
				$window.location="#/register-selectModules";
				$rootScope.applicationBoot=false;
			}
			else{
				$window.location="#/register";
				$rootScope.applicationBoot=false;
			}
		};
		
		funcCheckSettings()
			.then(funcCheckNoMediaFile)
			.then(funcPopulateUserSession)
			.then(funcCheckRegistrationProgress)
			.then(funcGetProgressPromise,SynthErrorHandler);
	}]);
})(synthMobile);

