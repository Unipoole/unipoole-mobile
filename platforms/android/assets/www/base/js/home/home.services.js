"use strict";synthMobile.factory("HomeService",["$q","$filter","DataService","LoggerService","UserSession","SynthFail",function(e,r,o,t,i,n){function c(){}t("HomeService");return c.prototype.getHomeTools=function(){var t=e.defer();return o.getModuleData(i.activeModule).then(function(e){var o=e.toolDescriptions,i=r("object2Array")(o);i=r("filter")(i,{menu:!0}),i=r("orderBy")(i,"seq"),t.resolve(i)},n(t)),t.promise},new c}]);