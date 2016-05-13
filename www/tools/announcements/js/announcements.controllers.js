'use strict';


/**
 * Announcement list controller
 */
synthMobile.controller('AnnouncementListCtrl',
	['$scope', '$rootScope', 'AnnouncementService', 'SynthErrorHandler',
	function($scope, $rootScope, AnnouncementService, SynthErrorHandler) {
		
		$rootScope.activePage="announcements";
		$rootScope.breadcrumbs = [{'name' : 'Announcements'}];
		
		// Put all announcements on UI
		AnnouncementService
		.getAnnouncements()
		.then(function(announcements) {
			$scope.announcements = announcements;
		},SynthErrorHandler);
	}
])

/**
 * Announcement Detail controller
 */
.controller('AnnouncementDetailCtrl', 
	['$scope','$rootScope', '$routeParams', 'AnnouncementService', 'DataService','UserSession', 'SynthErrorHandler',
	function($scope, $rootScope, $routeParams, AnnouncementService, DataService,UserSession, SynthErrorHandler) {
		$rootScope.activePage="announcements";
		$rootScope.breadcrumbs = [{'name' : 'Announcements', 'url' : "#/tool/announcements"}];
		
		// Get the specific announcement
		AnnouncementService
		.getAnnouncement($routeParams.announcementId)
		.then(function(announcement) {
			$scope.announcement=announcement;
			$rootScope.breadcrumbs = [{'name' : 'Announcements', 'url' : "#/tool/announcements"}];
		},SynthErrorHandler);
	}
]);