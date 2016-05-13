/* 
 * base/js/settings/settings.controllers.js
 */
(function(synthMobile){
'use strict';

/**
 * Controller for the home screen
 */
synthMobile.controller('SettingsCtrl', 
    ['$scope','$rootScope', '$window', 'LoggerService','DataService','AppSyncStatus','SynthErrorHandler','UserSession','SyncService',
    function($scope, $rootScope, $window,  LoggerService, DataService, AppSyncStatus, SynthErrorHandler, UserSession, SyncService) {
    	var LOG = LoggerService("SettingsCtrl");
    	$rootScope.activePage="settings";
    	$rootScope.breadcrumbs = [{'name' : 'Settings'}];
    	/*
    	 * DELETE ALL APPLICATION DATA!
    	 */
    	$scope.deleteApplicationData = function(){
    		DataService
    			.deleteAllApplicationData()
    			.then(function(){
    				SyncService.stopBackgroundSync();
    				AppSyncStatus.allOutSync();
    				$rootScope.tools=null;
    				UserSession.clearSession();
	    			$window.location = "#/boot";
	    		},
	    		SynthErrorHandler);
    	}
    	
    	/*
    	 * Auto sync
    	 */
    	$scope.animateSwitch=false;
    	$scope.autoSyncDownload = UserSession.settings && UserSession.settings.autoSyncDownload;
    	$scope.autoSyncUpload = UserSession.settings && UserSession.settings.autoSyncUpload;
    	$scope.animateSwitch=true;
    	
    	/*
    	 * Modules
    	 */
    	$scope.modules = UserSession.modules;
    	$scope.defaultModule = UserSession.defaultModule;
    	$scope.numModules = UserSession.modules == null ? 0 : Object.keys(UserSession.modules).length;
    	
    	$scope.selectDefaultModule = function(moduleId, $event){
    		$event.stopPropagation();
			var registrationData = {
				'defaultModule' : moduleId
			};
			DataService.mergeToRegistrationData(registrationData).then(function(){
    			$scope.defaultModule=moduleId;
    			UserSession.defaultModule=moduleId;
    		});
    	};

    	$scope.$watch('autoSyncDownload', function(newValue, oldValue){
    		DataService.mergeToSettingsData({
    			'autoSyncDownload' : newValue
    		});
    		UserSession.settings.autoSyncDownload=newValue;
    		if(UserSession.settings.autoSyncDownload || UserSession.settings.autoSyncUpload){
    			SyncService.startBackgroundSync();
    		}
    		else{
    			SyncService.stopBackgroundSync();
    		}
    	});
    	
    	$scope.$watch('autoSyncUpload', function(newValue, oldValue){
    		DataService.mergeToSettingsData({
    			'autoSyncUpload' : newValue
    		});
    		UserSession.settings.autoSyncUpload=newValue;
    		if(UserSession.settings.autoSyncDownload || UserSession.settings.autoSyncUpload){
    			SyncService.startBackgroundSync();
    		}
    		else{
    			SyncService.stopBackgroundSync();
    		}
    	});
    	
    	
    	
    }
])


/**
 * Controller where user can select which modules should be managed by the application
 */
.controller('SettingsSelectModulesCtrl',
	['$scope', '$rootScope',
	 function($scope, $rootScope){
		$rootScope.breadcrumbs = [{'name' : 'Settings'},{'name' : 'Select Modules'}];
		
		var availableModules = [];
		var takenModules = [];
		
		/*
		 * Get the allowed modules for the user
		 */
		var funcGetAllowedModules = function(user){
			return SyncAPIService
				.getAllowedSites()
				.then(function(modules){
					availableModules=modules;
				});
		},
		/*
		 * Get the current registation data for the user
		 */
		funcGetCurrentModules = function(){
			return UserService.getRegistrationData().then(function(registrationData){
				takenModules=registrationData.modules;
			});
		},
		/*
		 * Build the data to display to the user
		 */
		funcBuildModulesList = function(modules){
			// Add the available, to the current, if not there
			
		};
		
		funcGetAllowedModules()
		.then(funcGetCurrentModules)
		.then(funcBuildModulesList);
	}
 ]);
})(synthMobile);