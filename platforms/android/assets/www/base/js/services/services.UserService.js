"use strict";synthMobile.factory("UserService",["$q","DataService","SynthFail",function(t,e){function n(){this.PROGRESS_AUTHENTICATE=0,this.PROGRESS_SELECT_MODULES=1,this.PROGRESS_COMPLETED=2}return n.prototype.getRegistrationProgress=function(){var t=this;return e.getRegistrationData().then(function(e){return null==e.username?t.PROGRESS_AUTHENTICATE:null==e.modules||null==e.defaultModule?t.PROGRESS_SELECT_MODULES:null!=e.defaultModule?t.PROGRESS_COMPLETED:n.PROGESS_AUTHENTICATE})},n.prototype.isRegistrationComplete=function(){var t=this;return t.getRegistrationProgress().then(function(e){return t.PROGRESS_COMPLETED==e})},new n}]);