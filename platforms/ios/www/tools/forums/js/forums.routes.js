"use strict";synthMobile.config(["$routeProvider",function(r){r.when("/tool/forums",{templateUrl:"tools/forums/partials/forums-list.html"}).when("/tool/forums/:forumId",{templateUrl:"tools/forums/partials/discussions-list.html"}).when("/tool/forums/:forumId/:discussionId",{templateUrl:"tools/forums/partials/discussion.html"}).when("/tool/forums/:forumId/:discussionId/reply",{templateUrl:"tools/forums/partials/reply.html"}).when("/tool/forums/:forumId/:discussionId/:messageId/reply",{templateUrl:"tools/forums/partials/reply.html"})}]),SynthAttachmentMiner.addHandler("forums",function(r,n){var t=[];for(var e in r){var o=r[e],a=o.discussions;for(var s in a){var i=a[s];t=t.concat(SynthAttachmentMiner.parseArray(i.attachments,n));var l=i.messages;for(var m in l){var d=l[m];t=t.concat(SynthAttachmentMiner.parseArray(d.attachments,n))}}}return t}),SynthEmbeddedImageHandler.addHandler("forums",function(r,n){for(var t in r){var e=r[t],o=e.discussions;for(var a in o){var s=o[a];s.content=SynthEmbeddedImageHandler.fixForHtmlElement(s.content,n);var i=s.messages;for(var l in i){var m=i[l];m.content=SynthEmbeddedImageHandler.fixForHtmlElement(m.content,n)}}}return r}),SynthUploadResponseHandler.addHandler("forums",function(r,n){var t=JSON.stringify(r);for(var e in n){var o=n[e],a=new RegExp(e,"g");t=t.replace(a,o)}return t}),SynthLinkHandler.addHandler("forums",function(r){for(var n in r){var t=r[n],e=t.discussions;for(var o in e){var a=e[o];a.content=SynthLinkHandler.fixContent(a.content);var s=a.messages;for(var i in s){var l=s[i];l.content=SynthLinkHandler.fixContent(l.content)}}}return r});