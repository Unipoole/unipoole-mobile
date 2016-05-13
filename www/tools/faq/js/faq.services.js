'use strict';

/* Services */

/**
 * Create factory for the announcement Service
 */
synthMobile.factory('FaqService',
	['$q', 'DataService', 'UserSession', 'LoggerService',
	 function($q, DataService, UserSession, LoggerService) {
		
		var LOG = LoggerService("FaqService");
		
		/**
		 * 
		 */
		function FaqService() {
		}

		/**
		 * Gets the Frequently asked questions
		 */
		FaqService.prototype.getFaqs = function() {
			return DataService.getToolData(UserSession.activeModule, "faq");
		};


		/**
		 * Gets a faq for the specified faq id
		 */
		FaqService.prototype.getFaq = function(faqId) {
			return DataService.getToolData(UserSession.activeModule, "faq")
				.then(function(data) {
					return data[faqId];
				});
		};


		return new FaqService();
	}
]);
