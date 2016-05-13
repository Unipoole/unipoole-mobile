'use strict';

/* App Module */
/**
 * Configure routes for schedule
 */
synthMobile.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/tool/schedule', {templateUrl: 'tools/schedule/partials/schedule.html'});
  }]);

/**
 * Add a handler to download attachments for forums
 */
SynthAttachmentMiner.addHandler('schedule', 'default');

/**
 * Add handler to fix images for each announcement
 */
SynthLinkHandler.addHandler('schedule', function(toolContent){
	
	// Loop through all the entries of the update
	for(var key in toolContent){
		// Fix the content
		var html = toolContent[key].description;
		if(html != null){
			toolContent[key].description = SynthLinkHandler.fixContent(html)
		}
	}
	return toolContent;
});

