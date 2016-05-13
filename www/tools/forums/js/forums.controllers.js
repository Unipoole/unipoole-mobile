'use strict';

/**
 * Controller for displaying the list of Forums
 */
synthMobile.controller('ForumListCtrl', 
	['$scope', '$rootScope', '$window', 'ForumService', 'SynthErrorHandler',
	function($scope, $rootScope, $window, ForumService, SynthErrorHandler) {

		$rootScope.activePage="forums";
		$rootScope.breadcrumbs = [{'name' : 'Discussions'}];
		
		// Attach the properties count method from utilities
		$scope.props = $window.synth.utilities.getNumberOfProperties;
		
		// Put all announcements on UI
		ForumService
			.getForums()
			.then(function(forums) {
				$scope.forums = forums;
			},SynthErrorHandler);
	}
])

/**
 * Controller for displaying the list of Discussions in a Forum
 */
.controller('DiscussionListCtrl', 
	['$scope', '$rootScope', '$window', '$routeParams', 'ForumService', 'SynthErrorHandler',
	function($scope, $rootScope, $window, $routeParams, ForumService, SynthErrorHandler) {

		$rootScope.activePage="forums";
		
		// Attach the properties count method from utilities
		$scope.props = $window.synth.utilities.getNumberOfProperties;
		
		// Get the specific announcement
		ForumService
			.getForum($routeParams.forumId)
			.then(
				// Success
				function(forum) {
					$rootScope.breadcrumbs = [{'name' : 'Discussions', 'url' : "#/tool/forums"}, 
					                          {'name' : forum.title}];
					$scope.forum = forum;
				}, 
				// Failed
				SynthErrorHandler
			);
	}
])

/**
 * Controller to display an actual discussion
 */
.controller('DiscussionCtrl', 
	['$scope', '$rootScope', '$window', '$routeParams', 'ForumService', 'SynthErrorHandler',
	function($scope, $rootScope, $window, $routeParams, ForumService, SynthErrorHandler) {
		
		$rootScope.activePage="forums";
		
		// Called when the user wishes to reply
		$scope.reply = function(messageId){
			if (messageId){
				$window.location=$window.location+"/" + messageId + "/reply";
			}
			else{
				$window.location=$window.location+"/reply";
			}
		};
		// Get the discussion
		ForumService
			.getDiscussion($routeParams.forumId, $routeParams.discussionId)
			.then(
				// Success
				function(discussion) {
					$scope.discussion = discussion;
					
					ForumService
					.getForum($routeParams.forumId)
					.then(
						// Success
						function(forum) {
							$rootScope.breadcrumbs = [{'name' : 'Discussions', 'url' : "#/tool/forums"},
							                          {'name' : forum.title, 'url': '#/tool/forums/'+$routeParams.forumId}];
						},
						SynthErrorHandler);
					
				},
				// Failed
				SynthErrorHandler
			);
	}
])


/**
 * Controller to for replying on a discussion
 */
.controller('ReplyCtrl', 
	['$scope', '$rootScope', '$window', '$routeParams', 'ForumService', 'SynthErrorHandler','SyncService',
	function($scope, $rootScope, $window, $routeParams, ForumService, SynthErrorHandler, SyncService) {
		$rootScope.activePage="forums";
		// Flag if we are replying on a message, else we are replying on a discussion
		var replyingOnMessage = $routeParams.messageId !== undefined;
		
		if (replyingOnMessage){
			// Get the discussion
			ForumService
				.getMessage($routeParams.forumId, $routeParams.discussionId,$routeParams.messageId)
				.then(
					// Success
					function(message) {
						$scope.replyMessage = message;
						setupTopic(message.topic);
						$scope.discussion = discussion;
						$rootScope.breadcrumbs = [{'name' : 'Discussions', 'url' : "#/tool/forums"},
						                          {'name' : 'Reply'}];
					},
					// Failed
					SynthErrorHandler
				);
		}
		else{
			// Get the discussion
			ForumService
				.getDiscussion($routeParams.forumId, $routeParams.discussionId)
				.then(
					// Success
					function(discussion) {
						$scope.replyMessage = discussion;
						setupTopic(discussion.topic);
					},
					// Failed
					SynthErrorHandler
				);
		}
		
		function setupTopic(topic){
			// Initialise the topic for the reply
			if (topic.indexOf("Re:") < 0){
				$scope.topic = "Re: " + topic;
			}
			else{
				$scope.topic = topic;
			}
		}
		

		// Called when the user submits the form
		$scope.submit = function(){
			var message = $scope.message;
			var data = {
				'topic' : $scope.topic,
				'message' : $scope.message,
				'messageId' : $routeParams.messageId
			};
			
			// Call service to add the reply message
			ForumService
				.replyOnMessage($routeParams.forumId, $routeParams.discussionId, data)
				.then(
					// Success
					function(){
						SyncService.notifyChanges('forums');
						$window.location="#/tool/forums/" + $routeParams.forumId + "/" + $routeParams.discussionId;
					},
					// Failed
					SynthErrorHandler
				);
		}
		
	}
]);