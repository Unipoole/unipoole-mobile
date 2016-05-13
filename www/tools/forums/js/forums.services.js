'use strict';

/* Services */

/**
 * Create factory for the announcement Service
 */
synthMobile.factory('ForumService',
	['$q', 'DataService','UserSession','LoggerService',
	 function($q, DataService, UserSession, LoggerService) {
		
		// A reference to a logger
		var LOG = LoggerService('ForumService');

		function ForumService() {
		}
		
		/**
		 * Gets the data for the Forums tool
		 */
		ForumService.prototype._getData = function(){
			return DataService.getMergedToolData(UserSession.activeModule, "forums");
		};
		

		/**
		 * Gets the forums
		 */
		ForumService.prototype.getForums = function() {
			return this._getData();
		};

		/**
		 * Gets the discussions for a forum
		 * @param forumId ID of the forum to get
		 */
		ForumService.prototype.getForum = function(forumId) {
			return this._getData()
				.then(function(data) {
					return data[forumId];
				});
		};
		
		
		/**
		 * Gets a specific discussion
		 * 
		 * @param forumId ID of the forum in which the discussion is
		 * @param discussionId ID of the discussion to get
		 */
		ForumService.prototype.getDiscussion = function(forumId, discussionId) {
			return this.getForum(forumId)
				.then(function(forum) {
					return forum.discussions[discussionId];
				});
		};
		
		/**
		 * Gets a specific message
		 * @param forumId ID of the forum in which the discussion is
		 * @param discussionId ID of the discussion to get
		 * @param messageId ID of the message to get
		 */
		ForumService.prototype.getMessage = function(forumId, discussionId, messageId) {
			return this.getDiscussion(forumId, discussionId)
				.then(function(discussion) {
					return discussion.messages[messageId];
				});
		};
		
		/**
		 * Adds a reply message to a discussion
		 * @param forumId ID of the forum the message is in
		 * @param discussionId ID of the discussion the message is in
		 * @param data Object with the following fields:
		 *  {
		 *  	'topic' 	: "<topic for the message>",
		 *  	'message' 	: "<the reply message>",
		 *  	'messageId'	: "<id of message, only if the reply is on a message, not a discussion>" 
		 *  }
		 */
		ForumService.prototype.replyOnMessage = function(forumId, discussionId, data) {
			var deferred = $q.defer();
			var service = this;
			// We are replying to a message
			if (data.messsageId){
				service.getMessage(forumId, discussionId, data.messsageId).then(
						// Success
						function(message){
							saveNewMessage(message);
						},
						// Failed
						function(error){
							deferred.reject(error);
						}
					);
			}
			// We are replying on a discussion
			else{
				service.getDiscussion(forumId, discussionId).then(
					// Success
					function(discussion){
						saveNewMessage(discussion);
					},
					// Failed
					function(error){
						deferred.reject(error);
					}
				);
			}
			
			/**
			 * Function to save the new message to the replying message
			 */
			function saveNewMessage(replyingToMessage){
				var mergeData = {};
				
				// Create the new message entry
				var now = moment().toISOString();
				var uid = DataService.generateUID();
		        var newMessage = {
		            "id"			: uid,
		            "topic"			: data.topic,
		            "content"		: data.message,
		            "depth"			: (replyingToMessage.depth+1), // Calculate depth
		            "url"			: null,
		            "parent"		: replyingToMessage.id, // Calculate parent
		            "status"		: "READY",
		            "attachments"	: null,
		            "create_date"	: now,
		            "creator_name"	: UserSession.username,
		            "creator_id"	: UserSession.lms_id,
		            "discussion_id"	: discussionId,
		            "group_size"	: 0, // ?
		            "site_id"		: UserSession.activeModule,
		            "attachment_count": 0,
		            "reply_count"	: 0
		        };
				
				// Create the merge data for the new message
				mergeData[forumId] = {};
				mergeData[forumId].discussions = {};
				mergeData[forumId].discussions[discussionId] = {};
				mergeData[forumId].discussions[discussionId].messages = {};
				mergeData[forumId].discussions[discussionId].messages[uid] = newMessage;
				
				// Now merge to the upload file
		        DataService.mergeToToolData(UserSession.activeModule, 'forums', mergeData, true).then(
		        	// Success
		        	function(){
		        		deferred.resolve();
		        	},
		        	// Failed
		        	function(error){
		        		deferred.reject(error);
		        	});
			}
			return deferred.promise;
		};
		

		return new ForumService();
	}
]);
