'use strict';

/* App Module */
synthMobile.config(['$routeProvider',
	function($routeProvider) {
	  $routeProvider.
	    when('/tool/welcome', 		{ templateUrl: 'tools/welcome/partials/welcome.html',	controller: 'WelcomeCtrl' });
	}]);

/**
 * Add a handler to download attachments for welcome
 */
SynthAttachmentMiner.addHandler('welcome', 'default');
/**
 * Add handler to fix images in welcome data
 */
SynthEmbeddedImageHandler.addHandler('welcome', function(toolContent, dataPath){
	toolContent.content = SynthEmbeddedImageHandler.fixForHtmlElement(toolContent.content, dataPath);
	return toolContent;
});