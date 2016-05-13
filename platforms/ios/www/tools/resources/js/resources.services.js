"use strict";synthMobile.factory("ResourcesService",["$q","DataService","UserSession","SyncAPIService","LoggerService",function(e,t,r,n,o){function a(){}o("ResourcesService");return a.prototype._getData=function(){return t.getMergedToolData(r.activeModule,"resources")},a.prototype.getItem=function(e){return this._getData().then(function(t){return t[e]})},a.prototype.getDirectChildren=function(e){function t(){var t=e;return null==t&&(t="/group/"+r.activeModule+"/"),o.getItem(t)}function n(e){return o._getData().then(function(t){var r=e.treeId,n=[];for(var o in t){var a=t[o];a.treeParentId===r&&n.push(a)}return n})}var o=this;return t().then(n)},a.prototype.downloadResource=function(e){function o(){return t.getDataDirectory("resources").then(function(t){var r=e.treeId;r=r.replace(/[|&:;$%@"<>()+,]/g,"_"),r=encodeURI("cdvfile://localhost/persistent"+t.fullPath+r),c={downloadKey:e.downloadKey,downloadPath:r}})}function a(){return n.getFileFromServer(c.downloadKey,c.downloadPath)}function u(){var n={};return n[e.id]={isDownloaded:!0,downloadPath:c.downloadPath},t.mergeToToolData(r.activeModule,"resources",n,!1).then(function(){return n[e.id]})}var c;return o().then(a).then(u)},new a}]);