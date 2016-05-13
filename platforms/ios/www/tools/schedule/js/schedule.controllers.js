"use strict";synthMobile.controller("ScheduleCtrl",["$scope","$rootScope","ScheduleService","SynthErrorHandler",function(e,t,n,a){function i(e,t){var n={};for(var a in r){var i=r[a];null===i.end&&(i.end=i.start+1),e.isBefore(i.start)&&t.isAfter(i.end)&&(n[i.id]=i)}return n}t.activePage="schedule",t.breadcrumbs=[{name:"Schedule"}],e.filterOption="today";var r={};e.startCalendar=new Date,e.endCalendar=new Date,e.orderDateFunc=function(e){return moment(e.start).valueOf()},e.open=function(t,n){t.preventDefault(),t.stopPropagation(),"start"===n?(e.startCalendarOpen=!0,e.endCalendarOpen=!1):(e.endCalendarOpen=!0,e.startCalendarOpen=!1)},e.changedFilterOption=function(){var t=e.filterOption,n=moment(),a=moment();if("all"===t)return void(e.schedule=r);if("startEnd"===t){if(void 0===e.startCalendar||""===e.startCalendar)return void(e.schedule={});n=moment(e.startCalendar),a=void 0===e.endCalendar||""===e.endCalendar?moment(n).add("years",50):moment(e.endCalendar)}else if("today"===t)n=moment().startOf("day"),a=moment().endOf("day");else if("week"===t)n=moment().startOf("week"),a=moment().endOf("week");else if("month"===t)n=moment().startOf("month"),a=moment().endOf("month");else if("year"===t)n=moment().startOf("year"),a=moment().endOf("year");else if("specific"===t){var c=[];if(void 0!==e.specificYear&&""!==e.specificYear){if(e.specificMonthDisabled=!1,n=moment(e.specificYear,"YYYY"),void 0!==e.specificMonth&&""!==e.specificMonth){e.specificDayDisabled=!1,n=moment(e.specificYear+"-"+e.specificMonth,"YYYY-M");var o=moment(e.specificYear+"-"+e.specificMonth).daysInMonth();void 0!==e.specificDay&&""!==e.specificDay&&(e.specificDay>o&&(e.specificDay=1),n=moment(e.specificYear+"-"+e.specificMonth+"-"+e.specificDay,"YYYY-M-D"));for(var s=1;o>=s;s++)c.push(s);e.days=c}a=moment(n).add("years",50)}else e.specificMonthDisabled=!0,e.specificDayDisabled=!0;e.days=c}e.schedule=i(n,a)},n.getAll().then(function(t){r=t,e.schedule=r,e.changedFilterOption()},a)}]);