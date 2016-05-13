'use strict';

/* App Module */
/**
 * Configure routes for announcements 
 */
synthMobile.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider.
		when('/tool/forums', 											{templateUrl: 'tools/forums/partials/forums-list.html'}).
		when('/tool/forums/:forumId', 								{templateUrl: 'tools/forums/partials/discussions-list.html'}).
		when('/tool/forums/:forumId/:discussionId',					{templateUrl: 'tools/forums/partials/discussion.html'}).
		when('/tool/forums/:forumId/:discussionId/reply',				{templateUrl: 'tools/forums/partials/reply.html'}).
		when('/tool/forums/:forumId/:discussionId/:messageId/reply',	{templateUrl: 'tools/forums/partials/reply.html'});
}]);

/**
 * Add a handler to download attachments for forums
 */
SynthAttachmentMiner.addHandler('forums', function(contentData, dataPath){
	var filesToDownload = [];
	for (var forumKey in contentData) {
		var forum = contentData[forumKey];
		
		// Now loop through all the discussions
		var discussions = forum.discussions;
		for(var discussionKey in discussions){
			var discussion = discussions[discussionKey];
			filesToDownload = filesToDownload.concat(SynthAttachmentMiner.parseArray(discussion.attachments, dataPath));
			
			// Now loop through all the messages
			var messages = discussion.messages;
			for(var messageKey in messages){
				var message = messages[messageKey];
				filesToDownload = filesToDownload.concat(SynthAttachmentMiner.parseArray(message.attachments, dataPath));
			}
		}
	}
	return filesToDownload;
});


/**
 * Add handler to fix images for each discussion and messages
 */
SynthEmbeddedImageHandler.addHandler('forums', function(toolContent, dataPath){
	for (var forumKey in toolContent) {
		var forum = toolContent[forumKey];
		// Now loop through all the discussions
		var discussions = forum.discussions;
		for(var discussionKey in discussions){
			var discussion = discussions[discussionKey];
			discussion.content = SynthEmbeddedImageHandler.fixForHtmlElement(discussion.content, dataPath);
			// Now loop through all the messages
			var messages = discussion.messages;
			for(var messageKey in messages){
				var message = messages[messageKey];
				message.content = SynthEmbeddedImageHandler.fixForHtmlElement(message.content, dataPath);
			}
		}
	}
	return toolContent;
});

/**
 * Add handler to fix uploaded content
 */
SynthUploadResponseHandler.addHandler('forums', function(sentObject, responseObject){
	var string = JSON.stringify(sentObject);
	// Replace Ids
	for(var oldKey in responseObject){
		var newKey = responseObject[oldKey];
		var regEx = new RegExp(oldKey, 'g');
		// Replace all instances of the old key with the new key
		string = string.replace(regEx, newKey);
	}
	return string;
});

/**
 * Add handler to fix images for each announcement
 */
SynthLinkHandler.addHandler('forums', function(toolContent){
	for (var forumKey in toolContent) {
		var forum = toolContent[forumKey];
		// Now loop through all the discussions
		var discussions = forum.discussions;
		for(var discussionKey in discussions){
			var discussion = discussions[discussionKey];
			discussion.content = SynthLinkHandler.fixContent(discussion.content);
			// Now loop through all the messages
			var messages = discussion.messages;
			for(var messageKey in messages){
				var message = messages[messageKey];
				message.content = SynthLinkHandler.fixContent(message.content);
			}
		}
	}
	return toolContent;
});

