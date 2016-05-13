'use strict';

/* Controllers */

/**
 * Controller for the home screen
 */
synthMobile.controller('HomeCtrl', 
    ['$scope','$rootScope', '$filter','$window', 'HomeService' ,'LoggerService','SynthErrorHandler',
    function($scope, $rootScope, $filter, $window, HomeService, LoggerService,SynthErrorHandler) {
    	var LOG = LoggerService("HomeCtrl");
    	
    	$rootScope.activePage="home";
    	$rootScope.breadcrumbs = [{'name' : 'Home'}];
    	
    	// Add the tools to the UI
		HomeService
			.getHomeTools()
			.then(
				// Success
				function(tools){
					$rootScope.tools = tools;
				},
				// Failed
				SynthErrorHandler
			);
    }
]);

