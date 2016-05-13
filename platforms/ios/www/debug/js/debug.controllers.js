'use strict';

/* Controllers */

var debugControllers = angular.module('debugControllers', []);

debugControllers.controller('DebugController', 
	['$scope', 'DataService', 'SyncService',
	 function($scope,DataService, SyncService) {
		
    DataService.getLocalFilePath().then(function(path){
        $scope.localFilePath = path;
    });
    
    SyncService.syncTool("announcements").then(
    	// Success
		function(data){
			$scope.syncResponse = JSON.stringify(data);
		},
		// Fail
		function (message){
			$scope.syncResponse = "something broke! " + message;
		});
}]);

