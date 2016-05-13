/* 
 * base/js/app.config.js
 */
(function(synthMobile){
'use strict';
synthMobile.factory("SynthConfig",[function(){
	return {
			
		// Name of the application
		'applicationName'	: 'Unipoole Mobile',
		
		// Name of the vendor
		'vendorName'		: 'OpenCollab',
		
		// URL to the vendor website
		'vendorURL'			: 'http://www.opencollab.co.za',
		
		/*
		 * Name of the directory where synthesis will save content.
		 * This will be relative to the directory which the native device
		 * selects as a suitable location for content. It might be on a external
		 * SD card, Internal SD card, or any location the system chooses.
		 * 
		 * WARNING: Never change this once in production! Student will not
		 * see the content they already downloaded, and content not uploaded
		 * yet will seem lost!
		 */
		'dataDir' : 'UnipooleMobile',
		
		/*
		 * Logging level
		 * DEBUG : 1,
		 * INFO  : 2
		 * WARN  : 3
		 * ERROR : 4
		 * NONE  : 5
		 */
		'logLevel'			: 1,
		
		// Should we log to console
		'logToConsole' : true,
		
		// Should we log to file
		'logToFile' : true,
		
		// Max size of the log file in bytes
		'logFileSize' : 1000000,
		
		// Number of log files to keep
		'logFileCount' : 5,
		
		// Base URL for the SynthEngine
		'baseURL' : 'http://unipoole.ac.za/unipoole-service',
		
		/*
		 * Mapping of tools to and from the remote service
		 */
		'toolMapping' : {
			'sakai.announcements'	: 'announcements',
			'announcements' 		: 'sakai.announcements',
			'unisa.faqs'			: 'faq',
			'faq'					: 'unisa.faqs',
			'sakai.yaft'			: 'forums',
			'forums'				: 'sakai.yaft',
			'unisa.welcome'			: 'welcome',
			'welcome'				: 'unisa.welcome',
			'sakai.schedule'		: 'schedule',
			'schedule'				: 'sakai.schedule',
			'client.base'			: 'base',
			'base'					: 'client.base',
			'learning_units'		: 'sakai.melete',
			'sakai.melete'			: 'learning_units',
			'resources'				: 'sakai.resources',
			'sakai.resources'		: 'resources'
		}
	};
}]);
})(synthMobile);