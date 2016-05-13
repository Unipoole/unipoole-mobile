'use strict';

/* Main application module */
var synthMobile = angular.module('SynthMobile', [
	'ngRoute',
	'ngAnimate',
	'ab-base64',
	'ui.bootstrap',
	'frapontillo.bootstrap-switch',
	'ng-iscroll'
])

/**
 * Configure routes for base application
 * Do not configure tool specific routes here!
 */
.config(
  ['$routeProvider','$compileProvider',
  function($routeProvider, $compileProvider) {
	  
	// Allow cordova files for image src
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|cdvfile):|data:image\//);
	
	$routeProvider
		.when('/boot',						{templateUrl: 'base/partials/boot.html',				controller: 'BootCtrl'})
		.when('/boot/:moduleId',			{templateUrl: 'base/partials/boot.html',				controller: 'BootCtrl'})
		.when('/home',						{templateUrl: 'base/partials/toolSelect.html',			controller: 'HomeCtrl'})
		.when('/settings', 					{templateUrl: 'base/partials/settings.html',			controller: 'SettingsCtrl' })
		.when('/settings-sync', 			{templateUrl: 'base/partials/settings-sync.html',		controller: 'SettingsSyncCtrl' })
		.when('/settings-chooseModules', 	{templateUrl: 'base/partials/selectModules.html',		controller: 'SettingsSelectModulesCtrl' })
		.when('/sync', 						{templateUrl: 'base/partials/sync.html',				controller: 'SyncCtrl' })
		.when('/sync-configure', 			{templateUrl: 'base/partials/sync-configure.html',		controller: 'SyncConfigureCtrl' })
		.when('/sync-progress', 			{templateUrl: 'base/partials/sync-progress.html',		controller: 'SyncProgressCtrl' })
		.when('/register', 					{templateUrl: 'base/partials/login.html',				controller: 'RegisterCtrl' })
		.when('/register-selectModules',	{templateUrl: 'base/partials/selectModules.html',		controller: 'RegisterSelectModuleCtrl' })
		.when('/register-modulesRegistration',{templateUrl: 'base/partials/registerModules.html',	controller: 'RegisterModuleRegistrationCtrl' })
		.otherwise({ redirectTo: '/boot' });
}])
/**
 * An factory for a method that will execute a number of promises
 * A promise function has to be specified that should either return another
 * promise to execute, or null when there are no more promises.
 * The factory function will return a promise which will resolve when the
 * promiseFunction returns null (no more promises)
 */
.factory("SynthQLoop",[ '$q', function($q){
	return function(promiseFunction){
		var deferred = $q.defer();
		function startNewPromise(){
			var newPromise = promiseFunction();
			// If we did not get a new promise, then we are done
			if (newPromise == null){
				deferred.resolve();
			}
			// We got a promise
			else{
				newPromise.then(
					// If the promise resolve, we get the next one
					startNewPromise,
					// If the promise failed, we fail too
					function(reason){
						deferred.reject(reason);
				});
			}
		}
		
		return {
			'then' : function(resolveFunction, errorFunction, statusFunction){
				startNewPromise();
				return deferred.promise.then(resolveFunction, errorFunction, statusFunction);
			},
			'notify' : function(update){
				console.log("need to update");
			}
			
		}
	}
}])

.factory("SynthQIfStatement",[ '$q', function($q){
	return function(promiseFunction, trueFunction, falseFunction){
		var deferred = $q.defer();
		
		promiseFunction().then(function(isTrue){
			var func = isTrue ? trueFunction : falseFunction;
			
			if(func == null){
				deferred.resolve();
				return;
			}
			
			func().then(function(){
				deferred.resolve();
				}, function(reason){
					deferred.reject(reason);
				});
		},
		function(reason){
			deferred.reject(reason);
		});
		
		
		return deferred.promise;
	}
}])
/**
 * Session object used for logins
 */
.factory("UserSession",[ function(){
	return {
		// Username of the active user
		'username' : null,
		
		// Authentication token to synthesis service
		'authToken' : null,
		
		// ID of this device
		'deviceId' : null,
		
		// Map of modules the user is registered for
		'modules' : {},
		
		// Flag if the user is registered for atleast one module
		'registered' : false,
		
		// Module currently active on the application
		'activeModule' : null, // Populated during boot
		
		// Update more complex attributes of the user session
		'updateSession' : function(userSession){
			for(var prop in userSession){
				this[prop] = userSession[prop];
			}
		},
		
		// Clear entire session
		'clearSession' : function(){
			for(var prop in this){
				if(typeof(this[prop]) === 'function'){
					continue;
				}
				this[prop] = null;
			}
		}
	}
}])

/**
 * Factory to create error with
 */
.factory("SynthError",['$http', function($http){
	
	// Map of errors
	var errors = {};
	
	// When this factory is created, we get the errorMessages
	$http({ method: 'GET', url: 'base/data/errorMessages.json'}).
	success(function(data, status, headers, config) {
		errors = data;
	}).
	error(function(data, status, headers, config) {
		// If this fails..........
	});
	
	/*
	 * Return a function that will create an error that
	 * can be used by the SynthErrorHandler.
	 * 
	 * Params:
	 * errorCode - an int representing the error code, or an object that represent the error
	 * additional (optional) - a string with additional info about the error.
	 */
	return function(errorCode, additional){
		
		/*
		 * Check if the error is an exception
		 */
		if(errorCode instanceof Error){
			var error = angular.copy(errors[1000]);
			error.additional = errorCode.message;
			return error;
		}
		
		/* Check if the error Code is an object.
		 * if it is an object, it is a error like response from 
		 * a server, we will then create a proper error from it */ 
		else if (typeof(errorCode) === "object"){
			return {
				'id' : errorCode.errorCode,
				'errorMessage' : errorCode.message,
				'errorInstruction' : errorCode.instruction,
				'additional' : additional
			};
		}
		else{
			var error = angular.copy(errors[errorCode]);
			if (additional){
				error.additional = additional;
			}
			return error;
		}
		
	};
}])
/**
 * Default fail method that rejects a deferred
 * by passing the error as the reason.
 */
.factory("SynthFail",[function(){
	return function(deferred){
		return function(error){
			deferred.reject(error);
		};
	}
}])

/**
 * Default fail method that rejects a deferred
 * by passing the error as the reason.
 */
.factory("SynthCheckResponseError",['SynthError','LoggerService','DataService','UserSession',
	function(SynthError, LoggerService, DataService, UserSession){
	
	var LOG = LoggerService("SynthCheckResponseError");
	
	return function(deferred, response){
		
		/*
		 * If authentication failed, we will remove the auth token
		 * from our saved file and from the UserSession
		 */ 
		if(response.errorCode === 2002){
			var newData = {
				'authToken' : null
			};
			UserSession.updateSession(newData);
			DataService.mergeToRegistrationData(newData);// There might be a little sync issue here
		}
		
		/* If there is no status field, all is good */
		if (response.status === undefined) {
			// Return false; there was no error
			return false;
		}
		
		/* If the response from the server had a status of 'SUCCESS', all is
		 * good and no need to reject */
		else if (response.status === 'SUCCESS') {
			// Return false; there was no error
			return false;
		}
		/* If the response from the server did not have a status of 'SUCCESS'
		 * we have to reject the promise. We create a new SynthError by passing
		 * the server response. */
		else{
			LOG.isWARN() && LOG.warn("Got error response : " + JSON.stringify(response));
			if(deferred != null){
				deferred.reject(SynthError(response));
			}
			// Return true; there was an error
			return true;
		}
	}
}])
/**
 * Factory method for the error handler.
 * This error handler will display the error modal dialog with the error message.
 * When this factory is called, it will always return a rejected promise
 * with the error that it handles.
 */
.factory("SynthErrorHandler",['$q','$rootScope', 'SynthError', function($q, $rootScope, SynthError){
	return function(synthError){
		
		/*
		 * If the synthError is not really a synth error.
		 * We convert it to one.
		 */
		if(synthError instanceof Error){
			synthError = SynthError(synthError);
		}
			
		/* On the root scope there is an object 'synthError' which
		 * is used by the error dialog */
		$rootScope.synthError = synthError;
		
		// Show the error dialog
		$("#synthErrorModal").modal('show');
		
		/* You must return a rejected promise, else if you had
		 * a chain of promised, the chain will continue on with a
		 * successfull promise */
		return $q.reject(synthError); 
	};
}])

/**
 * Factory that contains the application's sync status.
 * This object is ONLY entended to be used to indicate if the application 
 * is in sync. DO NOT use this object as a pass-through object between sync controllers/services
 */
.factory("AppSyncStatus",['$rootScope', function($rootScope){
	return {
		// Flag if the app is overall in sync
		'inSync' : false,
		
		// Array of tools which each will have an inSync flag
		'tools' : {},
		
		// Function to mark all as out of sync
		'allOutSync' : function(){
			this.inSync = false;
			this.tools = {};
		},
		
		/*
		 * Function to update the sync status of a tool
		 * If no tool is specified, it will update the overall status
		 */
		'update' : function(inSync, tool){
			if (tool == null){
				this.inSync = false;
			}
			else{
				this.tools = this.tools || {};
				this.tools[tool] = this.tools[tool] || {};
				this.tools[tool].inSync = inSync;
			}
		},
		
		// Function to update the sync status of all the tools
		'updateTools' : function(tools){
			if(tools == null){
				this.tools = {};
			}else{
				this.tools = tools;
			}
		}
	};
}])

/**
 * Helper to authenticate a user
 * The success callback of the promise will receive the following object
 * 
 * {
 *	'code' 	 : 'success code ',
 *	'username' : 'the username',
 *	'password' : 'the password'
 * }
 * 
 * The success code can be compared with the following variables:
 * SynthAuthenticateUser.SUCCESS	- 0
 * SynthAuthenticateUser.FAILED	 - 1
 * SynthAuthenticateUser.CANCELLED  - 2
 */
.factory("SynthAuthenticateUser",
	['$q','UserSession', 'SyncAPIService', '$rootScope',
	 function($q, UserSession, SyncAPIService, $rootScope){
	return {
		'FAILED' : '1',
		'SUCCESS' : '0',
		'CANCELLED' : '2',
		'login' : function(titleText, submitText){
			var deferred = $q.defer();
			
			/*
			 * If we have the password, we don't have to ask again
			 */
			if (UserSession.authToken != null){
				deferred.resolve({'code' : 0,
					'username' : UserSession.username,
					'authToken' : UserSession.authToken});
				return deferred.promise; 
			}
		
			function cleanup(){
				$rootScope.authenticationModel = null;
				$rootScope.authenticationOk = null;
				$rootScope.authenticationCancelled = null;
			}
		
			// Reset model used for login
			$rootScope.authenticationModel = {
				// Username of the current user
				'username' 		: UserSession.username,
				
				// Password of the current user
				'password' 		: null,
				
				// Flag if the authentication failed
				'authFailed' 	: false,
				
				// Message to show if authentication failed
				'message' 		: null,
				
				// Instruction to show if the authentication failed
				'instruction' 	: null,
				
				// Text to display on the submit button
				'submitText' 	: (submitText ? submitText : "Authenticate"),
				
				// Title to display for the login
				'titleText' 	: (titleText ? titleText : "Please enter password")
			};
			
			// Callback when the user presses OK to authenticate
			$rootScope.authenticationOk = function(){
				SyncAPIService
				.authenticateUser($rootScope.authenticationModel.username, $rootScope.authenticationModel.password)
				.then(
					function(result){
						if(result.authenticated){
							$("#synthAuthenticationModal").modal('hide');
							UserSession.authToken = result.authToken;
							deferred.resolve({'code' : 0,
											  'username' : $rootScope.authenticationModel.username,
											  'password' : $rootScope.authenticationModel.password}); // SUCCESS
							cleanup();
						}else{
							// Get the message and instruction from the result and display
							$rootScope.authenticationModel.message = result.message;
							$rootScope.authenticationModel.instruction = result.instruction;
							$rootScope.authenticationModel.password = null;
							$rootScope.authenticationModel.authFailed = true;
						}
						
					},
					function(error){
						$("#synthAuthenticationModal").modal('hide');
						cleanup();
						deferred.reject(error);
					});
				
			};
			
			// Callback when the user cancelled Authentication
			$rootScope.authenticationCancelled = function(){
				$("#synthAuthenticationModal").modal('hide');
				cleanup();
				deferred.resolve({'code' : 2}); // Cancelled
			};
			
			// Show the error dialog
			$("#synthAuthenticationModal").modal('show');

			return deferred.promise;
		}
	};
}])

/**
 * 
 * @param {type} param1
 * @param {type} param2
 */
.filter('noEscape', ['$sce', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
}])

/**
 * Filter to convert an object list to an array
 */
.filter('object2Array', function() {
	return function(input) {
		var out = []; 
		for(var i in input){
			var obj = input[i];
			obj.key = i;
			out.push(obj);
		}
		return out;
	}
})

/**
 * Filter to convert an array list to an object
 */
.filter('array2Object', function() {
	
	/**
	 * @param input input Array
	 * @param srcIdName name of the field in the source array that contains the id
	 */
	return function(input, srcIdName) {
		var out = {}; 
		srcIdName = srcIdName || "id";
		for(var idx=0 ; idx < input.length; idx++){
			var srcObject = input[idx];
			out[srcObject[srcIdName]] = srcObject;
		}
		return out;
	}
})

/**
 * Filter to format dates
 */
.filter('formatDate', function() {
	return function(date, format) {
		
		// If there is no format use a default format
		if (!format) {
			format = "YYYY-MM-DD h:mm a";
		}
		
		// If there is no date, return an empty string
		if (date === null || date === '') {
			return '';
		}
		return moment(date).format(format);
	}
})

/**
 * Filter to convert bytes to a size
 */
.filter('bytesToSize', function() {
	return function(bytes, showZero) {
		var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		
		if (showZero && bytes === 0){
			return '0';
		}
		
		if (bytes === undefined || bytes === 0 ) {
			return 'n/a';
		}
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		if (i === 0) {
			return bytes + ' ' + sizes[i];
		}
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	};
})

/**
 * Filter that will only return the attachments that are meant as attachments, 
 * not returning any inline content attachments
 */
.filter('attachments', function() {
	return function(attachments) {
		var out = []; 
		for(var aId in attachments){
			var attachment = attachments[aId];
			if (attachment.link === false){
				out.push(attachment);
			}
		}
		return out;
	}
})

.controller('AppController',
['$scope', '$routeParams', '$window', 'UserSession','UserService','SynthConfig','AppSyncStatus','SyncService',
 function($scope, $routeParams, $window, UserSession, UserService, SynthConfig, AppSyncStatus, SyncService){
	
	/**
	 * Callback function to open the vendor website
	 */
	$scope.linkVendor = function(){
		window.open(SynthConfig.vendorURL, "_system");
	};
	
	// Name of the vendor for the application
	$scope.vendorName = SynthConfig.vendorName;
	
	// Name of the application
	$scope.applicationName = SynthConfig.applicationName;
	
	// User session object
	$scope.userSession = UserSession;
	
	// Application sync status object
	$scope.appSyncStatus = AppSyncStatus;
	
	// The initial sync background task is started by the boot process
	function onPaused(){
		SyncService.stopBackgroundSync();
	}
	
	function onResume(){
		SyncService.startBackgroundSync();
	}
	
	document.addEventListener("pause", onPaused, false);
	document.addEventListener("resume", onResume, false);

	// Set default options for some scrollers
	$scope.myScrollOptions = $scope.myScrollOptions || {};
	$scope.myScrollOptions["menuScroll"] = { // TODO move to the menu directive
		scrollbars: true
	};
	
	/**
	 * Function to go back from the button on the screen
	 */
	$scope.goBack = function(){
		if ($scope.activePage === 'home' || $scope.activePage === 'register'|| $scope.activePage === 'boot'){
			// iOS cannot exit an application
			if(device.platform !== 'iOS'){
				navigator.notification.confirm(
					"Are you sure you want to exit the application?",
					function(index){
						if (index === 2){
							navigator.app.exitApp();
						}
					},
					"Exit Application",
					["No","Yes"]);
			}
		}else {
			navigator.app.backHistory();
		}
	};
	
	/**
	 * Redirect the native back button to the same handler when the user
	 * clicks the back button on the application
	 */
	document.addEventListener("backbutton", function(){
		$scope.goBack();
	}, false);
}]);


/**
 * An object that manages handlers that have tool specific handlers to manage
 * the mining of attachments in tool specific data.
 * 
 * Params:
 * toolName - name of the tool locally to SynthMobile - not SynthService name
 * funcHandler - function for handler - or the word "default" to use default implementation
 * 
 * The handler method should conform to the following rules:
 * 1) Accept the tool data as the first parameter of the handler method and the download path as the second.
 * 2) The handler must update the data to include the full local path for the attachments
 * 3) Return an array of files to download. The data structure for these files are:
 *	{
 *	  'downloadKey' : '<the key>',
 *	  'downloadPath' : '<relative path to download file>'
 *	
 *	}
 * 4) Return an empty array if there are no attachments to download
 * 
 */
var SynthAttachmentMiner = {
	// Add a handler
	'addHandler' : function(toolName, funcHandler){
		if (this.handlers == null){
			this.handlers = {};
		}
		if (this.handlers[toolName] == null){
			
			if (typeof (funcHandler) === 'string' && funcHandler === 'default'){
				this.handlers[toolName] = this.defaultHandler;
			}
			else{
				this.handlers[toolName] = funcHandler;
			}
		}
	},
	// Get a handler
	'getHandler' : function(toolName){
		if (this.handlers == null){
			return null;
		}
		return this.handlers[toolName];
	},
	'parseArray' : function(attachArray, localDirectory){
		var filesToDownload = [];
		if (attachArray) {
			for (var i = 0; i < attachArray.length; i++) {
				/*
				 *  Ignore attachments that does not have a download key
				 *  This is a bug from the server's side if this happens
				 */
				if (attachArray[i].downloadKey == null){
					continue;
				}
				attachArray[i].downloadPath = localDirectory + "/" + attachArray[i].downloadPath;
				filesToDownload.push(attachArray[i]);
			}
		}
		return filesToDownload;
	},
	/*
	 * Default implementation for downloading attachments
	 * This implementation assumes that the attachments are
	 * on the root level of the content data.
	 */
	'defaultHandler' : function (contentData, localDirectory) {
		var filesToDownload = [];
		for (var key in contentData) {
			filesToDownload = filesToDownload.concat(SynthAttachmentMiner.parseArray(contentData[key].attachments, localDirectory));
		}
		return filesToDownload;
	}
};

/**
 * These handlers go through the newly downloaded content of a tool
 * and update the links to the actual location of the file on the device
 * 
 * The handler will be called with the following parameters
 * $1 - toolContent - the new delta of tool content
 * $2 - dataPath - The proper root path for attachments
 * 
 * The function must return the object with the fields updated
 * 
 * Example
 * 
 * function myHandler(toolContent, dataPath){
 *   var html = toolContent.fieldThatHasImage;
 *   toolContent.fieldThatHasImage = SynthEmbeddedImageHandler.fixForHtmlElement(html, dataPath);
 *   return toolContent;
 * }
 * 
 */
var SynthEmbeddedImageHandler = {
	// Add a handler
	'addHandler' : function(toolName, funcHandler){
		if (this.handlers == null){ // Do not use === here
			this.handlers = {};
		}
		if (this.handlers[toolName] == null){ // Do not use === here
			this.handlers[toolName] = funcHandler;
		}
	},
	// Get a handler
	'getHandler' : function(toolName){
		if (this.handlers == null){ // Do not use === here
			return null;
		}
		return this.handlers[toolName];
	},
	/*
	 * Fix the url of all embedded images
	 * This function creates a pseudo jquery html element, and finds all img tags
	 * inside the dom. It fixes the path from a relative path, to the full path
	 * to the image.
	 */
	'fixForHtmlElement' : function(htmlContent, dataPath){
		// Create the pseudo element to work with
		var dummyData = $('<div/>').html(htmlContent);
		// Find each image and create a promise to fix the image
		dummyData.find("img").each(function() {
			$(this).attr('src', dataPath+ "/" + $(this).attr('src'));
		});
		return dummyData.html();
	}
};

/**
 * Handlers for responses to uploads.
 * Some tools will have to fix ids for generated content to ids 
 * returned by the server.
 * 
 * The handler will be called with the following parameters
 * $1 - sentObject		- The original data String
 * $2 - responseObject	- The response from the server after the upload
 * 
 * The handler should return a string or object representing the 
 * fixed data.
 * 
 * Example
 * function myUploadHandler(sentObject, responseObject){
 * 		var string = JSON.stringify(sentObject);
 *		// Replace Ids
 *		for(var oldKey in responseObject){
 *			var newKey = responseObject[oldKey];
 *			var regEx = new RegExp(oldKey, 'g');
 *			// Replace all instances of the old key with the new key
 *			string = string.replace(regEx, newKey);
 *		}
 *		return string;
 * }
 * 
 */
var SynthUploadResponseHandler = {
		// Add a handler
		'addHandler' : function(toolName, funcHandler){
			if (this.handlers == null){ // Do not use === here
				this.handlers = {};
			}
			if (this.handlers[toolName] == null){ // Do not use === here
				this.handlers[toolName] = funcHandler;
			}
		},
		// Get a handler
		'getHandler' : function(toolName){
			if (this.handlers == null){ // Do not use === here
				return null;
			}
			return this.handlers[toolName];
		}
};

/**
 * Handlers to replace links embedded in tool content to links that open
 * in an external browser. The problem with embedded links is that they will
 * "takeover" your webview (i.e. your app!)
 * 
 * These handlers will need to find all the links and fix thems
 */
var SynthLinkHandler = {
		// Add a handler
		'addHandler' : function(toolName, funcHandler){
			if (this.handlers == null){ // Do not use === here
				this.handlers = {};
			}
			if (this.handlers[toolName] == null){ // Do not use === here
				this.handlers[toolName] = funcHandler;
			}
		},
		// Get a handler
		'getHandler' : function(toolName){
			if (this.handlers == null){ // Do not use === here
				return null;
			}
			return this.handlers[toolName];
		},
		/*
		 * Fixes all the links in the content string, and return back to fix
		 * html string
		 */
		'fixContent' : function(contentString){
			var dummyData = $('<div/>').html(contentString);
			
			// Replace all the links, with javascript to open it externally
			dummyData.find("a[href]").each(function() {
				var url = $(this).attr("href");
				$(this).attr("href", "javascript:window.open('" + url + "', '_system');");
				
			});
			
			// Return the new fixed html
			return dummyData.html();
		}
};