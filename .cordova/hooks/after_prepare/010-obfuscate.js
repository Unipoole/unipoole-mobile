#!/usr/bin/env node
var exec = require('child_process').exec;

// Platforms we are busy building
var platforms = process.env.CORDOVA_PLATFORMS.split(",");

// Directory where the webcontent of each platform should be placed
var platformWebDir = {
	"android" : "platforms/android/assets/",
	"ios" : "platforms/ios/"
};

// File we want to obfuscate
var obfuscateFiles = [
	"www/base/js/utilities.js",
	"www/base/js/app.js",
	"www/base/js/app.config.js",
	"www/base/js/boot/boot.controllers.js",
	"www/base/js/register/register.controllers.js",
	"www/base/js/home/home.controllers.js",
	"www/base/js/sync/sync.controllers.js",
	"www/base/js/settings/settings.controllers.js",
	"www/base/js/register/register.services.js",
	"www/base/js/home/home.services.js",
	"www/base/js/sync/sync.services.js",
	"www/base/js/settings/settings.services.js",
	"www/base/js/services/services.LoggerService.js",
	"www/base/js/services/services.UserService.js",
	"www/base/js/services/services.DataService.js",
	"www/base/js/services/services.SyncAPIService.js",
	"www/base/js/directives.js",
	"www/tools/announcements/js/announcements.routes.js",
	"www/tools/announcements/js/announcements.services.js",
	"www/tools/announcements/js/announcements.controllers.js",
	"www/tools/faq/js/faq.services.js",
	"www/tools/faq/js/faq.controllers.js",
	"www/tools/welcome/js/welcome.routes.js",
	"www/tools/welcome/js/welcome.services.js",
	"www/tools/welcome/js/welcome.controllers.js",
	"www/tools/forums/js/forums.routes.js",
	"www/tools/forums/js/forums.services.js",
	"www/tools/forums/js/forums.controllers.js",
	"www/tools/schedule/js/schedule.routes.js",
	"www/tools/schedule/js/schedule.services.js",
	"www/tools/schedule/js/schedule.controllers.js",
	"www/tools/learning_units/js/learning_units.routes.js",
	"www/tools/learning_units/js/learning_units.services.js",
	"www/tools/learning_units/js/learning_units.controllers.js",
	"www/tools/resources/js/resources.routes.js",
	"www/tools/resources/js/resources.services.js",
	"www/tools/resources/js/resources.controllers.js"
];

// Loop through each platform
for(var pIdx in platforms){
	var platform = platforms[pIdx];
	
	// Skip if it is a platform we don't have a web dir of
	if(platformWebDir[platform] == null){
		continue;
	}

	// Loop through each file for this platform
	for(var fIdx in obfuscateFiles) {
		var file = obfuscateFiles[fIdx];
		exec("uglifyjs " + file + " -m -c -o " + platformWebDir[platform] + file);
	}
}