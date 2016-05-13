"use strict";synthMobile.controller("RegisterCtrl",["$scope","$rootScope","$window","$q","SyncAPIService","UserSession","DataService","LoggerService","SynthErrorHandler","SynthError",function(e,r,t,o,n,i,u,s,l,a){s("RegisterCtrl");r.activePage="register",r.breadcrumbs=[{name:"Register"}],e.authFailed=!1,e.login=i;var c=function(){var r=e.login.username,t=e.login.password;return n.authenticateUser(r,t).then(function(e){return e.authenticated?void 0:o.reject(a(e))})},d=function(){t.location="#/register-selectModules"};e.submit=function(){c().then(d,l)}}]).controller("RegisterSelectModuleCtrl",["$scope","$rootScope","$window","UserSession","DataService","LoggerService","SyncAPIService","SynthErrorHandler",function(e,r,t,o,n,i,u,s){i("RegisterSelectModuleCtrl");r.activePage="register-selectModule",r.breadcrumbs=[{name:"Select Modules"}],e.login=o,e.error=!1,e.canContinue=!1,e.loadingModules=!0;var l=!0,a=function(){return u.getAllowedSites()},c=function(){for(var e=d(),r={},t=0;t<e.length;t++){var i=e[t];r[i.id]=i}o.registration=o.registration||{},o.registration.modules=r;var u={deviceId:device.uuid};return n.mergeToRegistrationData(u).then(function(){o.updateSession(u)})},d=function(){var r=e.modules;if(null==r)return null;for(var t=[],o=0;o<r.length;o++)if(r[o].selected&&!r[o].registered){var n=angular.copy(r[o]);delete n.selected,t.push(n)}return t},g=function(){var e=d();return null==e?null:e[0]},f=function(){return null!=g()},m=function(){e.errorMessage="You must select atleast one module",e.error=!0,e.canContinue=!1};a().then(function(r){if(e.loadingModules=!1,0==r.length)e.errorMessage="You are not registered for any modules",e.error=!1;else{if(o.modules)for(var t in r){var n=r[t];null!=o.modules[n.id]&&(n.registered=!0)}e.modules=r}},function(r){e.loadingModules=!1,s(r).then(function(){},function(){e.errorMessage="Failed to retrieve modules",e.error=!0})}),e.toggleModule=function(e){e.registered||(e.selected=!e.selected)},e.hasSelectedModules=f,e.$watch("hasSelectedModules()",function(r){l||r?(e.error=!1,e.canContinue=!0,l=!1):m()}),e.submit=function(){f()?c().then(function(){t.location="#/register-modulesRegistration"},s):(e.errorMessage="You must select atleast one module",e.error=!0)}}]).controller("RegisterModuleRegistrationCtrl",["$scope","$rootScope","$window","UserSession","DataService","RegisterService","LoggerService","SynthErrorHandler",function(e,r,t,o,n,i,u,s){function l(){var e=[];for(var r in o.registration.modules)o.modules&&null!=o.modules[r]||e.push(o.registration.modules[r]);return e}var a=u("RegisterModuleRegistrationCtrl");if(r.activePage="register-moduleRegistration",r.breadcrumbs=[{name:"Registering Modules"}],e.error=!1,e.busy=!0,null==o.registration.modules)return a.info("There are no modules for active user"),void(t.location="#/register");var c=l();if(e.modules=c,0==c.length)return void(t.location="#/home");var d=function(){return i.initModules(c)},g=function(){return i.registerModules(c)},f=function(){e.busy=!1,t.location="#/sync"},m=function(r){s(r).then(function(){},function(){a.error("Error while trying to register for modules"),e.error=!0,e.busy=!1})},v=function(){o.registered=!0;var e=jQuery.extend(!0,o.modules,o.registration.modules);o.modules=e;var r={modules:e};return null==o.defaultModule&&(r.defaultModule=c[0].name,o.defaultModule=c[0].name),o.activeModule=c[0].name,n.mergeToRegistrationData(r)};d().then(g).then(v).then(f,m)}]);