/* 
 * base/js/register/register.controllers.js
 */
(function(synthMobile){
'use strict';
/**
 * Controller to allow the user to authenticate
 */
synthMobile.controller('RegisterCtrl', 
	['$scope','$rootScope', '$window', '$q', 'SyncAPIService','UserSession','DataService', 'LoggerService','SynthErrorHandler','SynthError',
	function($scope, $rootScope, $window, $q, SyncAPIService, UserSession, DataService, LoggerService, SynthErrorHandler, SynthError) {
		var LOG = LoggerService("RegisterCtrl");
		
		$rootScope.activePage="register"
		$rootScope.breadcrumbs = [{'name' : 'Register'}];
		$scope.authFailed = false;
		$scope.login = UserSession;
		
		var funcAuthenticateUser = function(){
			var username = $scope.login.username;
			var password = $scope.login.password;
			return SyncAPIService
				.authenticateUser(username, password)
				.then(function(result){
					if(!result.authenticated){
						// $scope.login.password = null; // Clear entered password
						return $q.reject(SynthError(result));
					}
				});
		},
		funcCompleted = function(){
			$window.location = "#/register-selectModules"
		};
		
		// Submit handler
		$scope.submit = function(){
			funcAuthenticateUser().then(funcCompleted, SynthErrorHandler);
		};
}])

/**
 * Controller to allow the user to select modules that should be used by this application
 */
.controller('RegisterSelectModuleCtrl', 
	['$scope', '$rootScope', '$window', 'UserSession', 'DataService', 'LoggerService','SyncAPIService','SynthErrorHandler',
	function($scope, $rootScope, $window, UserSession, DataService, LoggerService, SyncAPIService, SynthErrorHandler) {
		var LOG = LoggerService("RegisterSelectModuleCtrl");
		
		$rootScope.activePage="register-selectModule";
		$rootScope.breadcrumbs = [{'name' : 'Select Modules'}];
		$scope.login = UserSession;
		$scope.error = false;
		$scope.canContinue = false;
		$scope.loadingModules = true
		var firstTime = true;
		
		
		var funcGetAllowedSites = function(){
			return SyncAPIService.getAllowedSites();
		},
		funcSaveRegistrationData = function(){
			// Get the modules the user choose
			var selectedModules = getSelectedModules();
			var newModules = {};
			/*
			 * If the user already has modules, we need to check that we
			 * only add the new ones
			 */ 
			for(var idx=0; idx < selectedModules.length; idx++){
				var module = selectedModules[idx];
				newModules[module.id] = module;
			}
			
			UserSession.registration = UserSession.registration || {};
			UserSession.registration.modules=newModules;
			
			// Save the username
			var registrationData = {
				'deviceId' : device.uuid // It should be safe to get this cordova value here
			};
			
			return DataService.mergeToRegistrationData(registrationData).then(function(){
				UserSession.updateSession(registrationData);
			});
		},
		getSelectedModules = function(){
			var modules = $scope.modules;
			
			// If there is no modules, we have nothing
			if(modules == null){
				return null;
			}
			var selectedModules = [];
			for (var idx = 0 ; idx < modules.length ; idx++){
				if (modules[idx].selected && !modules[idx].registered){
					var newModule = angular.copy(modules[idx]);
					delete newModule.selected;
					selectedModules.push(newModule);
				}
			}
			return selectedModules;
		},
		// Get the first module that the user selected
		getFirstSelectedModule = function(){
			var selectedModules = getSelectedModules();
			return selectedModules == null ? null : selectedModules[0];
		},
		// Function that returns true if there are selecte modules
		hasSelectedModules = function(){
			return getFirstSelectedModule() != null;
		},
		
		// Warns the user that a module must be selected
		warnSelectModule = function(){
			$scope.errorMessage = "You must select atleast one module";
			$scope.error = true;
			$scope.canContinue = false;
		};
		
		// The magic starts here
		funcGetAllowedSites().then(function(modules){
			$scope.loadingModules = false;
			// Show a message if the user is not registered for any modules
			if (modules.length == 0){
				$scope.errorMessage = "You are not registered for any modules";
				$scope.error = false;
			}else{
				
				/*
				 * Now that we have the modules, we need to select the ones 
				 * the user is already registered for
				 */
				if(UserSession.modules){
					for(var mIdx in modules){
						var module = modules[mIdx];
						if(UserSession.modules[module.id] != null){
							module.registered = true;
						}
					}
				}
				
				
				$scope.modules = modules;
			}
		}, function(error){
			$scope.loadingModules = false;
			SynthErrorHandler(error).then(function(){}, function(error){
				$scope.errorMessage = "Failed to retrieve modules";
				$scope.error = true;
			});
		});
		
		
		// Toggle the selection of a module
		$scope.toggleModule = function(module){
			
			// Do nothing if the user is already registered for the module
			if(module.registered) return;
			
			module.selected=!module.selected;
		};
		
		// Bind function
		$scope.hasSelectedModules = hasSelectedModules;
		
		// Watch the selected modules
		$scope.$watch('hasSelectedModules()', function(newValue, oldValue) {
			if(firstTime || newValue){
				$scope.error = false;
				$scope.canContinue = true;
				firstTime = false;
			}
			else{
				warnSelectModule();
			}
		});
		
		// Function to handle submit of the form
		$scope.submit = function(){
			
			// Check that there was a selection
			if (!hasSelectedModules()){
				$scope.errorMessage = "You must select atleast one module";
				$scope.error = true;
			}
			/*
			 * If there was modules selected, we will go to the next page
			 * where the device will register with the service that those
			 * modules will be used on the device.
			 */
			else{
				
				funcSaveRegistrationData().then(function(){
					// Go to the next page where the modules will get registered
					$window.location="#/register-modulesRegistration";
				},
				// Failed
				SynthErrorHandler);
			}
		};
}])

/**
 * Controller to register the modules with the sync engine
 */
.controller('RegisterModuleRegistrationCtrl', 
	['$scope', '$rootScope', '$window', 'UserSession', 'DataService', 'RegisterService','LoggerService','SynthErrorHandler',
	function($scope, $rootScope, $window, UserSession, DataService, RegisterService, LoggerService, SynthErrorHandler) {
		var LOG = LoggerService('RegisterModuleRegistrationCtrl');
		
		$rootScope.activePage="register-moduleRegistration";
		$rootScope.breadcrumbs = [{'name' : 'Registering Modules'}];
		$scope.error=false;
		$scope.busy=true;
		
		/*
		 * Check that the user still has a registration object on the user session.
		 * This object might be deleted if the user presses back after completing a 
		 * registration
		 */
		if (UserSession.registration.modules == null){
			LOG.info("There are no modules for active user");
			$window.location="#/register";
			return;
		}
		
		/*
		 * Add the modules the user selected to the model, to show progress
		 * of the registration of these modules
		 */
		
		function getUnregisteredModules(){
			var modules = [];
			for(var key in UserSession.registration.modules){
				/*
				 * Now that we have the modules, we need to select the ones 
				 * the user is already registered for
				 */
				if(!(UserSession.modules && UserSession.modules[key] != null)){
					modules.push(UserSession.registration.modules[key]);
				}
			}
			return modules;
		}
		var selectedModules = getUnregisteredModules();
		$scope.modules = selectedModules;
		
		// If there are no modules to register for, we are done
		if(selectedModules.length == 0){
			$window.location="#/home";
			return;
		}
		
		
		var funcInitModules = function(){
			return RegisterService.initModules(selectedModules);
		},
		funcRegisterModules = function(){
			return RegisterService.registerModules(selectedModules);
		},
		funcGoToSync = function(){
			$scope.busy=false;
			$window.location="#/sync";
		},
		funcHandleError = function(error){
			SynthErrorHandler(error)
			.then(function(){}, function(synthError){
				LOG.error("Error while trying to register for modules");
				$scope.error=true;
				$scope.busy=false;
			})
		},
		/*
		 * Use the first module selected as the current
		 * active module and save it to the registration file.
		 */ 
		funcSetDefaultModulePromise = function(){
			UserSession.registered = true;
			
			// Merge modules
			var newModules = jQuery.extend(true, UserSession.modules, UserSession.registration.modules);
			UserSession.modules=newModules;
			
			var mergeData = {
				'modules' : newModules
			};
			if(UserSession.defaultModule == null){
				mergeData.defaultModule = selectedModules[0].name;
				UserSession.defaultModule = selectedModules[0].name;
			}
			UserSession.activeModule = selectedModules[0].name;
			return DataService.mergeToRegistrationData(mergeData);
		};
		
		funcInitModules()
			.then(funcRegisterModules)
			.then(funcSetDefaultModulePromise)
			.then(funcGoToSync, funcHandleError);
	}]
);
})(synthMobile);

