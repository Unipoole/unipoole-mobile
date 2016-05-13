'use strict';


/**
 * Schedule controller
 */
synthMobile.controller('ScheduleCtrl', 
	['$scope', '$rootScope', '$filter', '$timeout', 'ScheduleService', 'SynthErrorHandler', 
	function($scope, $rootScope, $filter, $timeout, ScheduleService, SynthErrorHandler) {
		
		$rootScope.activePage="schedule";
		$rootScope.breadcrumbs = [{'name' : 'Schedule'}];
		
		// Defaults
		$scope.filterOption="today";
		
		var entireSchedule = [];
		$scope.startCalendar=new Date();
		$scope.endCalendar=new Date();
		$scope.loadingSchedule=true;
		
		
		/**
		 * Get function used for sorting events by date
		 */
		$scope.orderDateFunc = function(event){
			return moment(event.start).valueOf();
		};
		
		/**
		 * Function for when the calendar get opened.
		 */
		$scope.open = function($event, cal) {
		    $event.preventDefault();
		    $event.stopPropagation();
		    
		    if(cal === 'start'){
		    	$scope.startCalendarOpen = true;
		    	$scope.endCalendarOpen = false;
		    }
		    else{
		    	$scope.endCalendarOpen = true;
		    	$scope.startCalendarOpen = false;
		    }
		    
		};
		
		/**
		 * Function for when the user changes the filter option
		 */
		$scope.changedFilterOption = function(){
			$scope.loadingSchedule=true;
			// Start in new "thread"
			$timeout(function(){
				var filterType = $scope.filterOption;
				var fromDate = moment();
			    var toDate = moment();
			    
			    if (filterType === 'all') {
			    	$scope.schedule = entireSchedule;
			    	$scope.loadingSchedule=false;
			    	return;
			    }
			    else if (filterType === 'startEnd') {
			    	if ($scope.startCalendar === undefined || $scope.startCalendar === ''){
			    		$scope.schedule = [];
			    		$scope.loadingSchedule=false;
			    		return;
			    	}
			    	
			        fromDate = moment($scope.startCalendar);
			        if ($scope.endCalendar === undefined || $scope.endCalendar === ''){
			        	toDate = moment(fromDate).add('years', 50);
			        }
			        else{
			        	toDate = moment($scope.endCalendar);
			        }
			        
			    } else if (filterType === 'today') {
			        fromDate = moment().startOf('day');
			        toDate = moment().endOf('day');
			    } else if (filterType === 'week') {
			        fromDate = moment().startOf('week');
			        toDate = moment().endOf('week');
			    } else if (filterType === 'month') {
			        fromDate = moment().startOf('month');
			        toDate = moment().endOf('month');
			    } else if (filterType === 'year') {
			        fromDate = moment().startOf('year');
			        toDate = moment().endOf('year');
			    }
			    else if(filterType === 'specific'){
			    	
			    	var days = [];
			    	
			    	// If there is atleast a year
			    	if ($scope.specificYear !== undefined && $scope.specificYear !== ''){
			    		$scope.specificMonthDisabled = false;
			    		fromDate = moment($scope.specificYear, 'YYYY');
			    		
			    		if ($scope.specificMonth !== undefined && $scope.specificMonth !== ''){
			    			$scope.specificDayDisabled = false;
			    			fromDate = moment($scope.specificYear + "-" + $scope.specificMonth, 'YYYY-M');
			    			
			    			var daycount = moment($scope.specificYear + "-" + $scope.specificMonth).daysInMonth();
			    			if ($scope.specificDay !== undefined && $scope.specificDay !== ''){
			    				if ($scope.specificDay > daycount){
			    					$scope.specificDay = 1;
			    				}
			    				fromDate = moment($scope.specificYear + "-" + $scope.specificMonth + "-" + $scope.specificDay, 'YYYY-M-D');
			    			}
			    			for(var idx = 1 ; idx <= daycount ; idx++){
			    				days.push(idx);
			    			}
			    			$scope.days = days;
				    	}
			    		toDate = moment(fromDate).add('years', 50);
			    	}
			    	else{
			    		$scope.specificMonthDisabled = true;
			    		$scope.specificDayDisabled = true;
			    		
			    	}
			    	
			    	$scope.days = days;
			    }
			    $scope.loadingSchedule=false;
			    $scope.schedule = filterEvents(fromDate, toDate);
			}, 500);
			
			
		};
		
		ScheduleService
			.getAll()
			.then(
				// Success
				function(schedule){
					entireSchedule = $filter("object2Array")(schedule);
					$scope.changedFilterOption(); // Do the initial filter
				},
				// Fail
				SynthErrorHandler
			);

		
		/**
		 * Filters events between 2 dates
		 * 
		 * @param {Date} fromDate
		 * @param {Date} toDate
		 * @returns Array of events
		 */
		function filterEvents(fromDate, toDate) {
		    var filteredEvents = [];
		    
		    for (var eIdx in entireSchedule) {
		        var currentEvent = entireSchedule[eIdx];
		        if (currentEvent.end === null) {
		            currentEvent.end = currentEvent.start + 1;
		        }
		        if (fromDate.isBefore(currentEvent.start) && toDate.isAfter(currentEvent.end)) {
		            filteredEvents.push(currentEvent);
		        }
		    }
		    return filteredEvents;
		}
		
		
	}
]);
