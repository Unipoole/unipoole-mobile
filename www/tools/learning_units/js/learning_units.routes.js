'use strict';

/* App Module */
/**
 * Configure routes for announcements 
 */
synthMobile.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
      .when('/tool/learning_units', 				{templateUrl: 'tools/learning_units/partials/unit-list.html'})
      .when('/tool/learning_units/:unitId',			{templateUrl: 'tools/learning_units/partials/viewUnit.html'})
      .when('/tool/learning_units/:unitId/:sectionId',	{templateUrl: 'tools/learning_units/partials/viewSection.html'})
  }]);

/**
 * Add handler to fix images for each section
 */
SynthEmbeddedImageHandler.addHandler('learning_units', function(toolContent, dataPath){
	
	var regEx1 = new RegExp('/access/meleteDocs/content/private/meleteDocs/', 'g');
	var regEx2 = new RegExp('/uploads/', 'g');
	var resourcesPath = dataPath.replace('learning_units', 'resources');
	
	// Fix all the images in html content
	function fixImages(html){
		var dummyData = $('<div/>').html(html);
		// Find each image and create a promise to fix the image
		dummyData.find("img").each(function() {
			var src = $(this).attr('src');
			// Get the current source attribute, and update
			var newSrc = src;
			newSrc = newSrc.replace(regEx1, '/data/');
			newSrc = newSrc.replace(regEx2,'/images/');
			$(this).attr('data-src', resourcesPath + newSrc);
			$(this).attr('src', "#"); // Clear the src
			
			
			var resourceId = src;
			resourceId = resourceId.replace(regEx1, '/group/');
			resourceId = resourceId.replace(regEx2,'/images/');
			// Also add an extra attribute to set the resource Id
			$(this).attr('data-resource-id', resourceId);
			
		});
		return dummyData.html();
	}
	
	// Loop through all the entries of the update
	for(var key in toolContent){
		
		// Fix the content
		var html = toolContent[key].content;
		if(html != null){
			toolContent[key].content = fixImages(html)
		}
		
		// Fix the description
		html = toolContent[key].description;
		if(html != null){
			toolContent[key].description = fixImages(html);
		}
	}
	return toolContent;
});

/**
 * Add handler to fix images for each section
 */
SynthLinkHandler.addHandler('learning_units', function(toolContent){
	
	// Loop through all the entries of the update
	for(var key in toolContent){
		
		// Fix the content
		var html = toolContent[key].content;
		if(html != null){
			toolContent[key].content = SynthLinkHandler.fixContent(html)
		}
		
		// Fix the description
		html = toolContent[key].description;
		if(html != null){
			toolContent[key].description = SynthLinkHandler.fixContent(html);
		}
	}
	
	return toolContent;
});
