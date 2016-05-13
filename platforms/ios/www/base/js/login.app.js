'use strict';

/* App Module */
/**
 * Configure routes for announcements
 */
synthMobile.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginController'
      }).
      when('/selectModules', {
        templateUrl: 'partials/selectModules.html',
        controller: 'SelectModulesController'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);