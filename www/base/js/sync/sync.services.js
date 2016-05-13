/* 
 * base/js/sync/sync.services.js
 */
(function(synthMobile){
'use strict';

/* Services */
synthMobile.factory('SyncService',
	['$q', '$timeout', 'SyncAPIService', 'DataService', 'LoggerService', 'UserSession', 'AppSyncStatus', 'SynthQLoop', 'SyncSelection',
	 function($q, $timeout, SyncAPIService, DataService, LoggerService, UserSession, AppSyncStatus, SynthQLoop, SyncSelection){

	var LOG = LoggerService('SyncService');
	
	// The current syn primsie
	var syncBackgroundPromise = null;
	
	
	/**
	 * Constructor
	 */
	function SyncService(){
	}
	
	/**
	 * Gets a summary of the sync status
	 */
	SyncService.prototype.getSyncDetails = function(){
		return SyncAPIService.getSyncStatus(UserSession.activeModule);
	};
	
	/***
	 * Sync a tool
	 * @param toolname - name of the tool to sync
	 */
	SyncService.prototype.syncDownloadTool = function(toolname){
		return SyncAPIService.syncDownloadTool(UserSession.activeModule, toolname);
	};
	
	/***
	 * Performs a synchronise of the selected tools
	 */
	SyncService.prototype.syncSelected = function(syncSelection){
		
		// Initialise scope variables for this page
		var toolUploads = syncSelection.getUploadArray();
		var toolDownloads = syncSelection.getDownloadArray();
		var didUpdateBase = false;// Flag if we updated base. If base was updated we need to reload the tools
		var self = this;
		/*
		 * Function that will return promise for new download if there is any
		 * or returns null if there are no more promises for downloads
		 */
		var dIdx = 0;
		function getDownloadPromise(){
			var promise = null;
			var idx=dIdx++; // keep a local instance of the current index
			if (idx < toolDownloads.length){
				promise = self
							.syncDownloadTool(toolDownloads[idx].key)
							.then(function(){
								LOG.debug("Completed download for tool : " + toolDownloads[idx].key);
								toolDownloads[idx].downloadProgress = 100;
								
								// Set the flag if we downloaded for base
								if(toolDownloads[idx].key == "base") didUpdateBase=true;
							});
			}
			return promise;
		}
		
		/*
		 * Function that will return a promise for the new upload if there is any
		 * or returns null if there are no more promises for uploads
		 */
		var uIdx = 0;
		function getUploadPromise(){
			var promise = null;
			var idx = uIdx++; // keep a local instance of the current index
			if (idx < toolUploads.length){
				promise = self
							.syncUploadTool(toolUploads[idx].key)
							.then(function(){
								LOG.debug("Completed upload for tool : " + toolUploads[idx].key);
								toolUploads[idx].downloadProgress = 100;
							});
			}
			return promise;
		}
		
		
		
		// Get the promise to check the offline status
		function getOfflineStatusPromise(){
			return SyncAPIService.getSyncStatusOffline();
		}

		// Start loop with downloads
		return SynthQLoop(getDownloadPromise)
		// When all downloads are complete, we start with the uploads
		.then(function(){
			return SynthQLoop(getUploadPromise);
		})
		// Now we do an offline Sync status check just to update the UI
		.then(getOfflineStatusPromise)
		.then(function(){
			return {
				'didUpdateBase' : didUpdateBase
			}
		});
		
	};
	
	/***
	 * Sync a tool
	 * @param toolname - name of the tool to sync
	 */
	SyncService.prototype.syncUploadTool = function(toolname){
		return SyncAPIService.syncUploadTool(UserSession.activeModule, toolname);
	};
	
	SyncService.prototype.startBackgroundSync = function(){
		var self=this;
		// Make sure we are not already running
		if(syncBackgroundPromise == null){
			if(UserSession.settings && (UserSession.settings.autoSyncDownload || UserSession.settings.autoSyncUpload)){
				LOG.debug("Starting background sync timer... " + UserSession.settings.autoSyncInterval);
				// Start and save the promise
				syncBackgroundPromise = $timeout(function(){
					/*
					 * Because this happens somewhere later in time, we need to check if we actually still
					 * want to continue with the sync.
					 * This shouldn't be a problem because the UI should stop the timer promise when the user
					 * decides to cancel the auto sync, but we do it anyway ;)
					 */
					if(UserSession.settings && (UserSession.settings.autoSyncDownload || UserSession.settings.autoSyncUpload)){
						self._handleTimedSync();
					}
				},UserSession.settings.autoSyncInterval);
			}
			else{
				LOG.debug("Not going to start sync, it is not enabled");
			}
		}
		else{
			LOG.debug("Cannot start background sync again, already running...");
		}
	};
	
	SyncService.prototype._handleTimedSync = function(){
		LOG.debug("Need to check for sync now");
		var self=this;
		$timeout.cancel(syncBackgroundPromise);
		
		SyncAPIService.getSyncStatus().then(function(syncStatus){
			
			var syncSelection = SyncSelection.newInstance();
			syncSelection.tools = syncStatus.tools;
			
			if(UserSession.settings.autoSyncDownload){
				syncSelection.selectAllDownloads();
			}
			
			if(UserSession.settings.autoSyncUpload){
				syncSelection.selectAllUploads();
			}
			
			self.syncSelected(syncSelection).then(function(){
				syncBackgroundPromise = null;
				self.startBackgroundSync(); // Restart the timer
			});
			
		});
		
	};
	
	SyncService.prototype.stopBackgroundSync = function(){
		LOG.debug("Stopping background sync timer...");
		if(syncBackgroundPromise != null){
			$timeout.cancel(syncBackgroundPromise);
			syncBackgroundPromise = null;
		}
	};
	
	/**
	 * Function to notify this service that there are changes that need
	 * attention
	 */
	SyncService.prototype.notifyChanges = function(toolId){
		/*
		 * Update the sync flag immediately, don't wait for the syncstatus check to complete
		 */
		AppSyncStatus.tools[toolId].inSync=false;
		AppSyncStatus.inSync=false;
		this._handleTimedSync(); // Handle it now if we can
	};

	return new SyncService();
}]);
})(synthMobile);