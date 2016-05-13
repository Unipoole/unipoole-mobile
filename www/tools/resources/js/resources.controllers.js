'use strict';

/**
 * Controller for displaying the list of Forums
 */
synthMobile.controller('ResourcesCtrl', 
	['$scope', '$filter', '$rootScope', '$window', '$timeout', 'ResourcesService', 'DataService', 'SynthErrorHandler',
	function($scope, $filter, $rootScope, $window, $timeout, ResourcesService, DataService, SynthErrorHandler) {

		$rootScope.activePage="forums";
		$rootScope.breadcrumbs = [{'name' : 'Resources'}];
		$scope.showResourceInfo = false;
		$scope.loadingResources = true;
		
		$scope.parentResource = null; // Start off with root
		var dataDir = null;
		
		DataService.getDataDirectory('resources').then(function(dirEntry){
			dataDir = dirEntry.nativeURL;
		});
		
		$scope.goUp = function(){
			window.history.back();
		};
		
		function openDirectory(id){
			$scope.loadingResources = true;
			$timeout(function(){
				ResourcesService.getDirectChildren(id).then(function(items){
					
					var resources = items.sort(function(item1, item2){
						
						// If both is a directory or file, we go by name
						if((item1.directory && item2.directory) || (!item1.directory && !item2.directory)){
							if(item1.name < item2.name) return -1;
							if(item1.name > item2.name) return 1;
							return 0;
						}
						// If 1 is a directory and 2 not
						else if(item1.directory && !item2.directory){
							return -1;
						}
						// If 2 is a directory and 1 not
						else{
							return 1;
						}
					});
					
					$scope.loadingResources = false;
					$scope.resources = resources;
				});
			}, 500);
		}
		
		$scope.showInfo = function(resource, $event){
			$event.stopPropagation();
			$scope.resourceInfo=resource;
			$scope.myScroll["mainScroll"].scrollTo(0,0);// Scroll to top to see modal
			$scope.showResourceInfo = true;
		};
		
		
		$scope.hideInfo = function(){
			$scope.myScroll["mainScroll"].scrollTo(0,0);// Scroll to top to see modal
			$scope.showResourceInfo = false;
		}
		
		$scope.openResource = function(resource,$event){
			// If the resource is a directory, we will navigate into the directory
			if(resource.directory){
				history.pushState(resource, "Resources", "#/tool/resources");
				openDirectory(resource.id);
			}
			// If the resource is a file we will prompt to download or open it
			else{
				// If the file is already downloaded we will open it
				if(resource.isDownloaded){
					
					var openURL = function openURL(path){
						window.plugins.fileOpener.open({
														'path' : path,
														'mimeType' : resource.mime_type
											},
								function(){
								
								},
								function(error){
									alert(error);
								});
					};
					
					if (resource.mime_type == 'text/url') {
						DataService.getFileContentCDV(resource.downloadPath)
							.then(function(contents){
								openURL(contents);
							},SynthErrorHandler);
			        }
					else{
						openURL(dataDir + resource.treeId);
					}
					
				}
				
			}
		};
		
		$scope.downloadResource = function(resource, $event){
			if($event){
				$event.stopPropagation();
			}
			
			resource.busyDownloading = true;
			ResourcesService.downloadResource(resource)
			.then(
				// Success
				function(result){
					resource.busyDownloading = false;
					resource.isDownloaded = result.isDownloaded;
					resource.downloadPath = result.downloadPath;
				},
				//Failed
				function(reason){
					resource.busyDownloading = false;
					console.log(reason);
				},
				// Notifications
				function(notification){
					
					// Check the file download progress
					if(notification instanceof ProgressEvent){
						if(notification.lengthComputable) {
							resource.downloadProgress = (notification.loaded / notification.total) * 100;
						}else{
							resource.downloadProgress = (notification.loaded / resource.size) * 100; 
						}
					}
				});
		}
		
		function popHistory(event){
			if(event.state == null){
				openDirectory(null);
			}else{
				openDirectory(event.state.id);
			}
		}
		window.addEventListener("popstate", popHistory);
		// Cleanup listeners
		$scope.$on('$destroy', function () {
			window.removeEventListener("popstate", popHistory);
		});
		
		
		
		openDirectory(null);
	}
]);