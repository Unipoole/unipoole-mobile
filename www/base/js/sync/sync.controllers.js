/* 
 * base/js/sync/sync.controllers.js
 */
(function(synthMobile){
'use strict';
/**
 * Session object used for logins
 */
synthMobile.factory("SyncSelection",
	[ 'LoggerService', 'HomeService',
	function(LoggerService, HomeService){
		var LOG = LoggerService('SyncSelection');
	
	function SyncSelection(){
		this.tools = {};
	}
	
	/**
	 * Selects all tools that have upload/download sizes for sync
	 */
	SyncSelection.prototype.selectAll = function(){
		for(var tool in this.tools){
			this.tools[tool].downloadSelected = (this.tools[tool].contentDownloadSize + this.tools[tool].codeDownloadSize) > 0;
			this.tools[tool].uploadSelected = this.tools[tool].contentUploadSize > 0;
		}
	};
	
	/**
	 * Selects all the downloads
	 */
	SyncSelection.prototype.selectAllDownloads = function(){
		for(var tool in this.tools){
			this.tools[tool].downloadSelected = (this.tools[tool].contentDownloadSize + this.tools[tool].codeDownloadSize) > 0;
		}
	};
	
	/**
	 * Selects all the uploads
	 */
	SyncSelection.prototype.selectAllUploads = function(){
		for(var tool in this.tools){
			this.tools[tool].uploadSelected = this.tools[tool].contentUploadSize > 0;
		}
	};
	
	/**
	 * Get the total download size for selected items
	 */
	SyncSelection.prototype.getDownloadSize = function(){
		var size = 0;
		for(var tool in this.tools){
			if (this.tools[tool].downloadSelected){
				size += (this.tools[tool].contentDownloadSize + this.tools[tool].codeDownloadSize);
			}
		}
		return size;
	};
	
	/**
	 * Get the total upload size for selected items
	 */
	SyncSelection.prototype.getUploadSize = function(){
		var size = 0;
		for(var tool in this.tools){
			if (this.tools[tool].uploadSelected){
				size += this.tools[tool].contentUploadSize;
			}
		}
		return size;
	};
	
	/**
	 * Gets the total size for the sync selection
	 */
	SyncSelection.prototype.getTotal = function(){
		return this.getDownloadSize() + this.getUploadSize();
	};
	
	/**
	 * Returns an array of tools that are syncable
	 */
	SyncSelection.prototype.getSyncableToolsArray = function(){
		var syncables = [];
		for(var tool in this.tools){
			if ((this.tools[tool].contentDownloadSize + this.tools[tool].codeDownloadSize) > 0 || this.tools[tool].contentUploadSize > 0){
				syncables.push(this.tools[tool])
			}
		}
		return syncables;
	};
	
	/**
	 * Gets an array of tools that are selected for download
	 */
	SyncSelection.prototype.getDownloadArray = function(){
		var array = [];
		for(var tool in this.tools){
			LOG.debug(JSON.stringify(this.tools[tool]));
			if (this.tools[tool].downloadSelected){
				this.tools[tool].key = tool; // Add the tool key to the object itself
				array.push(this.tools[tool]);
			}
		}
		return array;
	};
	
	/**
	 * Gets an array of tools that are selected for upload
	 */
	SyncSelection.prototype.getUploadArray = function(){
		var array = [];
		for(var tool in this.tools){
			if (this.tools[tool].uploadSelected){
				this.tools[tool].key = tool; // Add the tool key to the object itself
				array.push(this.tools[tool]);
			}
		}
		return array;
	};
	/**
	 * Gets an array of tools that are selected for upload
	 */
	SyncSelection.prototype.newInstance = function(){
		return new SyncSelection();
	};
	
	return new SyncSelection();
}])


// Sync summary page controller
.controller('SyncCtrl', 
	['$scope', '$rootScope', '$window', 'SyncService','SyncSelection', 'LoggerService', 'SynthAuthenticateUser', 'SynthErrorHandler',
	 function($scope, $rootScope, $window, SyncService, SyncSelection, LoggerService, SynthAuthenticateUser, SynthErrorHandler) {
		var LOG = LoggerService("SyncCtrl");
		$rootScope.activePage="sync";
		$rootScope.breadcrumbs = [{'name' : 'Sync Summary'}];
		
		
		$scope.haveSyncStatus = false;
		// Get the scope summary and attach to model
		SyncService
			.getSyncDetails()
			.then(function(summary){
				$scope.syncSummary = summary;
				$scope.haveSyncStatus = true;
				SyncSelection.tools = summary.tools;
				SyncSelection.selectAll(); // Mark all downloads and uploads by default
			},SynthErrorHandler);
		
		
		// Callback function to go to the sync
		$scope.doSync = function(){
			SynthAuthenticateUser
			.login("Please enter password", "Sync")
			.then(function(result){
				if(SynthAuthenticateUser.FAILED == result.code){
					LOG.warn("Authentication failed");
				}
				else if(SynthAuthenticateUser.SUCCESS == result.code){
					$window.location="#/sync-progress";
				}
			});
		};
	}]
)

// Sync configure screen controller
.controller('SyncConfigureCtrl', 
	['$scope', '$rootScope', '$window', 'SyncService','SyncSelection', 'LoggerService','SynthAuthenticateUser',
	 function($scope, $rootScope, $window, SyncService, SyncSelection, LoggerService, SynthAuthenticateUser) {
		var LOG = LoggerService("SyncConfigureCtrl");
		$rootScope.activePage="sync";
		$rootScope.breadcrumbs = [{'name' : 'Sync', 'url': '#sync'},{'name' : 'Configure'}];
		
		// Callback function for selecting tools to download
		$scope.updateTotals = function(){
			$scope.syncUpload = SyncSelection.getUploadSize();
			$scope.syncDownload = SyncSelection.getDownloadSize();
			$scope.syncTotal = SyncSelection.getTotal();
		};
		
		// Callback function to go to the sync
		$scope.doSync = function(){
			SynthAuthenticateUser
			.login("Please enter password", "Sync")
			.then(function(result){
				if(SynthAuthenticateUser.FAILED == result.code){
					LOG.warn("Authentication failed");
				}
				else if(SynthAuthenticateUser.SUCCESS == result.code){
					$window.location="#/sync-progress";
				}
			});
		};
		
		$scope.tools = SyncSelection.getSyncableToolsArray();
		$scope.updateTotals();
	}]
)


// Sync progress screen controller
.controller('SyncProgressCtrl', 
	['$scope', '$rootScope', '$filter','$timeout', '$q', 'SyncService', 'DataService','SyncAPIService', 'SynthQLoop', 'SyncSelection', 'LoggerService','HomeService','SynthErrorHandler','SynthAuthenticateUser',
	 function($scope, $rootScope, $filter, $timeout, $q, SyncService, DataService, SyncAPIService, SynthQLoop, SyncSelection, LoggerService,HomeService, SynthErrorHandler,SynthAuthenticateUser) {
		var LOG = LoggerService('SyncProgressCtrl');
		
		// Update active page and breadcrumbs
		$rootScope.activePage="sync";
		$rootScope.breadcrumbs = [{'name' : 'Sync', 'url': '#sync'},{'name' : 'Synchronising'}];
		
		// Initialise scope variables for this page
		$scope.syncError = false; // Flag if there was an error during the sync
		$scope.syncBusy  = true;  // Flag if we are still busy syncing
		$scope.toolUploads = SyncSelection.getUploadArray();
		$scope.toolDownloads = SyncSelection.getDownloadArray();
		
		
		/*
		 * Function that will return a promise to update the tools.
		 * If the flag was set that base was updated, the tools will be reloaded
		 */
		function getUpdateToolsPromise(response){
			if(response.didUpdateBase === true){
				return HomeService
					.getHomeTools()
					.then(function(tools){
							$rootScope.tools = tools;
							return response;
						}
					);
			}else{
				return $q.when(response);
			}
		}
		
		function startSync(){
			SyncService.syncSelected(SyncSelection)
			// Update the tools if we need to
			.then(getUpdateToolsPromise)
			.then(
				// Overall success
				function(response){
					LOG.debug("Synching of all tools completed without error");
					$scope.syncBusy = false;
				},
				// Overall failure
				function(reason){
					LOG.debug("Synching of all tools completed with errors!");
					$scope.syncBusy = false;
					$scope.syncError = true;
					
					/*
					 * If the auth token is not valid, let user enter password
					 * again
					 */
					if(reason.id === 2002){
						SynthAuthenticateUser
						.login("Please enter password", "Sync")
						.then(function(result){
							if(SynthAuthenticateUser.FAILED == result.code){
								LOG.warn("Authentication failed");
							}
							else if(SynthAuthenticateUser.SUCCESS == result.code){
								startSync();
							}
						});
					}else{
						SynthErrorHandler(reason);
					}
				});
		}
		startSync();
		
	}]
);
})(synthMobile);