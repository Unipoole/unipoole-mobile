'use strict';

/* Services */

/**
 * Create factory for the announcement Service
 */
synthMobile.factory('ScheduleService',
	['$q', '$filter', 'DataService','UserSession', 'SynthFail',
	 function($q, $filter, DataService, UserSession, _SF) {

		function ScheduleService() {
		}
		
		/**
		 * Check for events with frequency and then add the events that must be generated
		 * 
		 * @param {type} eventData
		 */
		function addRecurringEvents(eventData) {
		    var newEvents = [];
		    for (var eventId in eventData) {
		        assignFrequencyHandler(newEvents, eventData[eventId]);
		    }
		    for (var j = 0; j < newEvents.length; j++) {
		        eventData[newEvents[j].id] = newEvents[j];
		    }
		}

		/**
		 * Checks which logic to use for the repeating 
		 * 
		 * @param {type} newEvents
		 * @param {type} event
		 */
		function assignFrequencyHandler(newEvents, event) {
		    switch (event.frequency) {
		        case 'day':
		        	addEvents(newEvents, event, 'days', 1);
		            break;
		        case 'MWF':
		        	addEvents(newEvents, event, 'days', 1, [1, 3, 5]);
		            break;
		        case 'TT':
		        	addEvents(newEvents, event, 'days', 1, [2, 4]);
		            break;
		        case 'week':
		        	addEvents(newEvents, event, 'weeks', 1);
		            break;
		        case 'month':
		        	addEvents(newEvents, event, 'months', 1);
		            break;
		        case 'year':
		        	addEvents(newEvents, event, 'years', 1);
		            break;
		        default:
		            break;
		    }
		}


		/**
		 * Adds the repeating events to the event list 
		 * 
		 * @param {type} newEvents
		 * @param {type} event
		 * @param {type} addType - 'days', 'months', 'weeks' or 'years'
		 * @param {type} multiply - use 2 to make it every second day
		 * @param {Array} allowedDays array of day numbers allowed starting Sunday at 0 
		 * to Saturday at 6
		 */
		function addEvents(newEvents, event, addType, multiply, allowedDays) {
		    if (event.recurs_until) {
		        var endDate = moment(event.recurs_until);
		        var count = 1;
		        while (endDate.isAfter(moment(event.start).add(addType, count * multiply))) {
		            var start = moment(event.start).add(addType, count * multiply);

		            if (!allowedDays || (jQuery.inArray(start.day(), allowedDays)) > -1) {
		                var copiedEvent = {};
		                jQuery.extend(copiedEvent, event);
		                copiedEvent.start = start.toDate();
		                copiedEvent.end = moment(event.end).add(addType, count * multiply).toDate();
		                copiedEvent.id = event.id + '_' + count++;
		                newEvents.push(copiedEvent);
		            }
		        }
		    } else {
		        var count2 = 1;
		        for (var i = 0; count2 < event.recurrence_count; i++) {
		            var start2 = moment(event.start).add(addType, (i + 1) * multiply);
		            if (!allowedDays || (jQuery.inArray(start2.day(), allowedDays)) > -1) {
		                var copiedEvent = {};
		                jQuery.extend(copiedEvent, event);
		                copiedEvent.start = start2.toDate();
		                copiedEvent.end = moment(event.end).add(addType, (i + 1) * multiply).toDate();
		                copiedEvent.id = event.id + '_' + i;
		                newEvents.push(copiedEvent);
		                count2++;
		            }
		        }
		    }
		}
		

		/**
		 * Gets ALL the schedule events
		 */
		ScheduleService.prototype.getAll = function() {
			return DataService.getToolData(UserSession.activeModule, "schedule")
				.then(function(events) {
						addRecurringEvents(events);
						return events;
					});
		};
		
		/**
		 * Gets a specific event
		 */
		ScheduleService.prototype.getEvent = function(eventId) {
			return this.getAll()
				.then(function(events) {
					return events[eventId];
				});
		};
		

		return new ScheduleService();
	}
]);
