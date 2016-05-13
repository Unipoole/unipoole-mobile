'use strict';


synthMobile.controller('LearningUnitsListCtrl', 
	['$scope', '$rootScope', '$filter', '$window', 'LearningUnitsService', 'SynthErrorHandler',
	function($scope, $rootScope, $filter, $window, LearningUnitsService, SynthErrorHandler) {

		$rootScope.activePage="learning_units";
		$rootScope.breadcrumbs = [{'name' : 'Learning Units'}];
		
		// Put all announcements on UI
		LearningUnitsService
			.getUnits()
			.then(function(units) {
				
				$scope.units = units;
				
			},SynthErrorHandler);
	}
])

.controller('LearningUnitsViewUnitCtrl', 
	['$scope', '$rootScope', '$routeParams', 'LearningUnitsService', 'SynthErrorHandler',
	function($scope, $rootScope, $routeParams, LearningUnitsService, SynthErrorHandler) {

		$rootScope.activePage="learning_units";
		$rootScope.breadcrumbs = [{'name' : 'Learning Units', 'url' : '#/tool/learning_units'}];
		
		$scope.unitId=$routeParams.unitId;
		
		// Get the unit
		LearningUnitsService
			.getSection($routeParams.unitId)
			.then(function(unit) {
				$scope.unit = unit;
				$rootScope.breadcrumbs = [{'name' : 'Learning Units', 'url' : '#/tool/learning_units'},
				                          {'name' : unit.title}];
			},SynthErrorHandler);
		
		// Get the sections
		LearningUnitsService
		.getSections($routeParams.unitId, true)
		.then(function(sections) {
			$scope.sections = sections;
		},SynthErrorHandler);
		
	}
])

.controller('LearningUnitsViewSectionCtrl', 
	['$scope','$q','$compile', '$rootScope', '$routeParams', 'SynthQLoop', 'LearningUnitsService','ResourcesService', 'SynthErrorHandler',
	function($scope,$q,$compile, $rootScope, $routeParams, SynthQLoop, LearningUnitsService, ResourcesService, SynthErrorHandler) {

		$rootScope.activePage="learning_units";
		
		$scope.sectionId=$routeParams.sectionId
		$scope.unitId=$routeParams.unitId;
		
		$("[ng-iscroll=mainScroll] .scroller").css("width", "auto");
		
		/**
		 * Function to find the current, next, and previous
		 * sections
		 */
		function findCurrentNextPrevious(sections){
			for(var idx = 0 ; idx < sections.length; idx++){
				if(sections[idx].id == $scope.sectionId){
					$scope.section = sections[idx];
					
					// Get the next if there is more
					if(idx+1 < sections.length){
						$scope.nextSection = sections[idx+1];
					}
					
					// Get the previous if there is less
					if (idx-1 >= 0){
						$scope.previousSection = sections[idx-1];
					}
					break;
				}
			}
		}
		
		// Get all the sections of the unit
		LearningUnitsService
			.getSections($routeParams.unitId, true)
			.then(function(sections) {
				findCurrentNextPrevious(sections);
			},SynthErrorHandler);
		
		
		// Get the unit to update the breadcrumb
		LearningUnitsService
		.getSection($scope.unitId)
		.then(function(unit) {
			$rootScope.breadcrumbs = [{'name' : 'Learning Units', 'url' : '#/tool/learning_units'},
			                          {'name' : unit.title, 'url' : '#/tool/learning_units/'+$scope.unitId}];
		},SynthErrorHandler);
		
		
		function fixAndDisplaySection(section){
			var contentElement = angular.element("<div>");
			contentElement.append(section.content);

			contentElement.find("[data-resource-id]").each(function() {
				// Create the directive element from the image
				var imageHolder = $(this);
				var templateElement = angular.element("<resource-img />");
				templateElement.attr("data-resource-id", imageHolder.attr('data-resource-id'));
				templateElement.attr("data-src", imageHolder.attr('data-src'));
				templateElement.attr("data-width", imageHolder.attr('width'));
				templateElement.attr("data-height", imageHolder.attr('height'));
				
				// Compile the directive and replace the element in the DOM
				var newElement = $compile(templateElement)($scope);
				imageHolder.replaceWith(newElement);
			});
			$("#sectionContent").replaceWith(contentElement);
		}
		
		// Get the current section
		LearningUnitsService
			.getSection($routeParams.sectionId)
			.then(function(section) {
				fixAndDisplaySection(section);
			},SynthErrorHandler);
		
		$scope.$on('$destroy', function() {
			$("[ng-iscroll=mainScroll] .scroller").css("width", "");
		});

	}
]);
