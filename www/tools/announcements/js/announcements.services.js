'use strict';

/* Services */

/**
 * Create factory for the announcement Service
 */
synthMobile.factory('AnnouncementService',
	['$q', 'DataService','UserSession', 'SynthFail',
	 function($q, DataService, UserSession, _SF) {

		function AnnouncementService() {
		}

		/**
		 * Gets all the announcements
		 */
		AnnouncementService.prototype.getAnnouncements = function() {
			var deferred = $q.defer();

			DataService
				.getToolData(UserSession.activeModule, "announcements")
				.then(
					// Success
					function(data) {
						deferred.resolve(data);
					},
					// Failed
					_SF(deferred)
				);
			return deferred.promise;
		};

		/**
		 * Gets an announcement for the specified ID
		 */
		AnnouncementService.prototype.getAnnouncement = function(id) {
			var deferred = $q.defer();

			DataService
				.getToolData(UserSession.activeModule, "announcements")
				.then(
					// Success
					function(data) {
						deferred.resolve(data[id]);
					},
					// Failed
					_SF(deferred)
				);
			return deferred.promise;
		};

		return new AnnouncementService();
	}
]);
