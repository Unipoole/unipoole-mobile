"use strict";synthMobile.config(["$routeProvider",function(e){e.when("/tool/schedule",{templateUrl:"tools/schedule/partials/schedule.html"})}]),SynthAttachmentMiner.addHandler("schedule","default"),SynthLinkHandler.addHandler("schedule",function(e){for(var n in e){var t=e[n].description;null!=t&&(e[n].description=SynthLinkHandler.fixContent(t))}return e});