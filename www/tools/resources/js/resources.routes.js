'use strict';

/* App Module */
/**
 * Configure routes for announcements 
 */
synthMobile.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider.
		when('/tool/resources', 		{templateUrl: 'tools/resources/partials/resources.html'});
	}
])
	
.directive("resourceImg", ['ResourcesService', function(ResourcesService){
	return {
		'restrict' : 'E',
		'templateUrl' : 'tools/resources/partials/resourceImg.html',
		'scope' : {},
		/*'replace' : true,*/
		'link': function (scope, element, attr){
			
			// Set attributes to scope
			scope.src=attr.src;
			scope.width=attr.width;
			scope.height=attr.height;
			scope.initialising = true;
			
			var resource = {};
			
			// Get the resource
			ResourcesService.getItem(attr.resourceId).then(function(r){
				scope.resource = resource = r;
				scope.initialising=false;
			});

			// Callback to download the image
			scope.download = function(){
				
				// Stop pizza buyers
				if(!resource.busyDownloading){
					resource.busyDownloading = true;
					ResourcesService.downloadResource(resource)
					.then(
						// Success
						function(result){
							resource.busyDownloading = false;
							resource.isDownloaded = true;
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
			}
		}
	};
}])
.directive("resourceListItem", [function(){
	return {
		'restrict' : 'A',
		'templateUrl' : 'tools/resources/partials/resourceListItem.html',
		/*'replace' : true,*/
		'link': function (scope, element, attr){

		}
	};
}]);

/**
 * Add a handler to download attachments for forums
 */
SynthAttachmentMiner.addHandler('resources-removed', function(contentData, dataPath){
	var filesToDownload = [];
	for(var key in contentData){
		var resource = contentData[key];
		/*
		 *	It's only something to download if :
		 *	Its not a directory
		 *	There is a download key
		 */
		
		if (resource.directory == false && resource.downloadKey != null){
			var path = resource.treeId;
			path = path.replace(/[|&:;$%@"<>()+,]/g, "_");
			path = encodeURI(dataPath + path);
			filesToDownload.push({
				'downloadKey' : resource.downloadKey,
				'downloadPath' : path
			});
		}
	}
	
	return filesToDownload;
});
