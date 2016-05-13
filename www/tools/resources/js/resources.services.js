'use strict';

/* Services */

/**
 * Create factory for the announcement Service
 */
synthMobile.factory('ResourcesService',
	['$q', 'DataService','UserSession','SyncAPIService', 'LoggerService',
	 function($q, DataService, UserSession, SyncAPIService, LoggerService) {
		
		// A reference to a logger
		var LOG = LoggerService('ResourcesService');

		function ResourcesService() {
		}
		
		ResourcesService.prototype._getData = function(){
			return DataService.getMergedToolData(UserSession.activeModule, "resources");
		};
		
		ResourcesService.prototype.getItem = function(id){
			return this._getData().then(function(data){
				return data[id];
			});
		};
		
		ResourcesService.prototype.getDirectChildren = function(parentId){
			var service = this;
			
			/*
			 * Returns a promise to get the parent
			 */
			function getParentPromise(){
				var pid = parentId;
				if(pid == null){
					pid = "/group/" + UserSession.activeModule + "/";
				}
				return service.getItem(pid);
			}
			
			/*
			 * Returns a promise to get the children
			 */
			function getChildrenPromise(parent){
				return service._getData().then(function(data){
					var pId = parent.treeId;
					
					/* remove the trailing slash if there is one
					if(pId.lastIndexOf('/')+1 === pId.length){
						pId = pId.substring(0,pId.length-1);
					}*/
					
					var items = [];
					for(var key in data){
						var item = data[key]
						if(item.treeParentId === pId){
							items.push(item);
						}
					}
					return items;
				});
			}
			
			return getParentPromise()
				.then(getChildrenPromise);
		};
		
		/**
		 * Downloads a resource to the tool's data.
		 * This function will also update the tool data to indicate that the resource
		 * has been downloaded.
		 */
		ResourcesService.prototype.downloadResource = function(resource){
			var resourceAttachment;
			/*
			 * Returns a promise to create an array of attachments to download.
			 * This array will only contain one attachment for this resource
			 */
			function getAttachmentPromise(){
				

				return DataService
					.getDataDirectory('resources')
					.then(function(directoryEntry){
							var path = resource.treeId;
							path = path.replace(/[|&:;$%@"<>()+,]/g, "_");
							path = encodeURI("cdvfile://localhost/persistent" + directoryEntry.fullPath + path);
							resourceAttachment = {
								'downloadKey' : resource.downloadKey,
								'downloadPath' : path
							};
					});
			}
			
			// Returns a promise to download the file
			function getDownloadAttachmentsPromise(){
				return SyncAPIService.getFileFromServer(resourceAttachment.downloadKey, resourceAttachment.downloadPath);
			}
			
			// Returns a promise to update the tool data that the resource is downloaded
			function getUpdateToolDataPromise(){
				var mergeData ={};
				mergeData[resource.id] = {
					'isDownloaded' : true,
					'downloadPath' : resourceAttachment.downloadPath
				};
				return DataService.mergeToToolData(UserSession.activeModule, 'resources', mergeData, false).then(function(){
					return mergeData[resource.id];
				});
			}
			
			return getAttachmentPromise()
				.then(getDownloadAttachmentsPromise)
				.then(getUpdateToolDataPromise);
		};
		
//		/**
//		 * Gets the direct children of the directory
//		 */
//		ResourcesService.prototype.getDirectChildren = function(dir){
//			
//			
//			function getTreeItem(item, currentDir){
//				var treeItem = {
//					'id' : null,
//					'name' : null,
//					'size' : null,
//					'isDirectory' : true,
//					
//				};
//				
//				/*
//				 * From where are we going to start searching for remaining directories.
//				 * If the current directory is root ('') we start from zero
//				 * Else we start searching from the index of the current directory
//				 */ 
//				var startIdx = (currentDir === '') ? 0 : item.treeId.indexOf(dir);
//				
//				// If the index is -1 then this item is not in the current directory
//				if(startIdx === -1){
//					return null;
//				}
//				
//				// This items name is the substring from the start index to the next slash
//				var nameEndIdx = item.treeId.indexOf('/', startIdx);
//				
//				// If there was no more slashed, we are on a leaf item
//				if(nameEndIdx === -1){
//					treeItem.name = item.name;
//					treeItem.isDirectory = item.directory;
//					treeItem.id = item.id;
//				}
//				// Else we are creating a directory from part of the path
//				else{
//					treeItem.name = item.treeId.substring(startIdx, nameEndIdx);
//					treeItem.isDirectory = true;
//				}
//			}
//			
//			
//			return this._getData().then(function(data){
//				var directoryItems = {}; // The items that are present in the current directory
//				
//				for(var key in data){
//					var item = getTreeItem(data[key]); 
//					directoryItems[item.name] = item;// TODO still need to filter and sort
//				}
//				return directoryItems;
//			});
//		};

		return new ResourcesService();
	}
]);
