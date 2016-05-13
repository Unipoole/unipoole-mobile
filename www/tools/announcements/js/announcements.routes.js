'use strict';

/* App Module */
/**
 * Configure routes for announcements
 */
synthMobile.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/tool/announcements', 					{templateUrl: 'tools/announcements/partials/announcements-list.html'}).
      when('/tool/announcements/:announcementId', 	{templateUrl: 'tools/announcements/partials/announcements-detail.html'});
  }]);

/**
 * Add a handler to download attachments for announcements
 */
SynthAttachmentMiner.addHandler('announcements', 'default');

/**
 * Add handler to fix images for each announcement
 */
SynthEmbeddedImageHandler.addHandler('announcements', function(toolContent, dataPath){
	for(var annoucementKey in toolContent){
		toolContent[annoucementKey].body = SynthEmbeddedImageHandler.fixForHtmlElement(toolContent[annoucementKey].body, dataPath);
	}
	return toolContent;
});

/**
 * Add handler to fix images for each announcement
 */
SynthLinkHandler.addHandler('announcements', function(toolContent){
	
	// Loop through all the entries of the update
	for(var key in toolContent){
		// Fix the content
		var html = toolContent[key].body;
		if(html != null){
			toolContent[key].body = SynthLinkHandler.fixContent(html)
		}
	}
	return toolContent;
});

