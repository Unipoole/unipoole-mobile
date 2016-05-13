'use strict';


/**
 * Welcome controller
 */
synthMobile.controller('WelcomeCtrl', 
	['$scope', '$q', 'WelcomeService', 'UserSession',
	function($scope, $q, WelcomeService, UserSession) {
		WelcomeService
		.getWelcome()
		.then(
			// Success
			function(welcome) {
				$scope.welcome=welcome;
			},
			// Failed
			function(){
				console.log("Failed to get welcome");
			}
		);
	}
]);