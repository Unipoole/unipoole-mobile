"use strict";synthMobile.factory("SyncSelection",["LoggerService","HomeService",function(o){function t(){this.tools={}}var e=o("SyncSelection");return t.prototype.selectAll=function(){for(var o in this.tools)this.tools[o].downloadSelected=this.tools[o].contentDownloadSize+this.tools[o].codeDownloadSize>0,this.tools[o].uploadSelected=this.tools[o].contentUploadSize>0},t.prototype.selectAllDownloads=function(){for(var o in this.tools)this.tools[o].downloadSelected=this.tools[o].contentDownloadSize+this.tools[o].codeDownloadSize>0},t.prototype.selectAllUploads=function(){for(var o in this.tools)this.tools[o].uploadSelected=this.tools[o].contentUploadSize>0},t.prototype.getDownloadSize=function(){var o=0;for(var t in this.tools)this.tools[t].downloadSelected&&(o+=this.tools[t].contentDownloadSize+this.tools[t].codeDownloadSize);return o},t.prototype.getUploadSize=function(){var o=0;for(var t in this.tools)this.tools[t].uploadSelected&&(o+=this.tools[t].contentUploadSize);return o},t.prototype.getTotal=function(){return this.getDownloadSize()+this.getUploadSize()},t.prototype.getSyncableToolsArray=function(){var o=[];for(var t in this.tools)(this.tools[t].contentDownloadSize+this.tools[t].codeDownloadSize>0||this.tools[t].contentUploadSize>0)&&o.push(this.tools[t]);return o},t.prototype.getDownloadArray=function(){var o=[];for(var t in this.tools)e.debug(JSON.stringify(this.tools[t])),this.tools[t].downloadSelected&&(this.tools[t].key=t,o.push(this.tools[t]));return o},t.prototype.getUploadArray=function(){var o=[];for(var t in this.tools)this.tools[t].uploadSelected&&(this.tools[t].key=t,o.push(this.tools[t]));return o},t.prototype.newInstance=function(){return new t},new t}]).controller("SyncCtrl",["$scope","$rootScope","$window","SyncService","SyncSelection","LoggerService","SynthAuthenticateUser","SynthErrorHandler",function(o,t,e,n,r,l,s,c){var i=l("SyncCtrl");t.activePage="sync",t.breadcrumbs=[{name:"Sync Summary"}],o.haveSyncStatus=!1,n.getSyncDetails().then(function(t){o.syncSummary=t,o.haveSyncStatus=!0,r.tools=t.tools,r.selectAll()},c),o.doSync=function(){s.login("Please enter password","Sync").then(function(o){s.FAILED==o.code?i.warn("Authentication failed"):s.SUCCESS==o.code&&(e.location="#/sync-progress")})}}]).controller("SyncConfigureCtrl",["$scope","$rootScope","$window","SyncService","SyncSelection","LoggerService","SynthAuthenticateUser",function(o,t,e,n,r,l,s){var c=l("SyncConfigureCtrl");t.activePage="sync",t.breadcrumbs=[{name:"Sync",url:"#sync"},{name:"Configure"}],o.updateTotals=function(){o.syncUpload=r.getUploadSize(),o.syncDownload=r.getDownloadSize(),o.syncTotal=r.getTotal()},o.doSync=function(){s.login("Please enter password","Sync").then(function(o){s.FAILED==o.code?c.warn("Authentication failed"):s.SUCCESS==o.code&&(e.location="#/sync-progress")})},o.tools=r.getSyncableToolsArray(),o.updateTotals()}]).controller("SyncProgressCtrl",["$scope","$rootScope","$filter","$timeout","$q","SyncService","DataService","SyncAPIService","SynthQLoop","SyncSelection","LoggerService","HomeService","SynthErrorHandler","SynthAuthenticateUser",function(o,t,e,n,r,l,s,c,i,a,S,d,y,u){function h(o){return o.didUpdateBase===!0?d.getHomeTools().then(function(e){return t.tools=e,o}):r.when(o)}function p(){l.syncSelected(a).then(h).then(function(){f.debug("Synching of all tools completed without error"),o.syncBusy=!1},function(t){f.debug("Synching of all tools completed with errors!"),o.syncBusy=!1,o.syncError=!0,2002===t.id?u.login("Please enter password","Sync").then(function(o){u.FAILED==o.code?f.warn("Authentication failed"):u.SUCCESS==o.code&&p()}):y(t)})}var f=S("SyncProgressCtrl");t.activePage="sync",t.breadcrumbs=[{name:"Sync",url:"#sync"},{name:"Synchronising"}],o.syncError=!1,o.syncBusy=!0,o.toolUploads=a.getUploadArray(),o.toolDownloads=a.getDownloadArray(),p()}]);