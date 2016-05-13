'use strict';
/**
 * Routes for faqs
 */
synthMobile.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/tool/faq', 		{ templateUrl: 'tools/faq/partials/faq-list.html'}).
      when('/tool/faq/:faqId',	{ templateUrl: 'tools/faq/partials/faq-detail.html'})
  }]);
