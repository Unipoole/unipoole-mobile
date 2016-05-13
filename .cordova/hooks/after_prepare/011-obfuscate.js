#!/usr/bin/env node
var fs = require('fs'),

// Compressor
compressor = require('node-minify'),

// Should we skip the obfuscate
jsObfuscator = 'uglifyjs',

// Options to pass to the JS obfuscator
jsObfuscatorOpts = ["-m", "-c"];

// Platforms we are busy building
var platforms = process.env.CORDOVA_PLATFORMS.split(",");
//If we are in dev mode we don't want to obfuscate
if(!!process.env.DEVELOPMENT && (process.env.DEVELOPMENT.indexOf("true") == 0)){
	jsObfuscator = 'no-compress';
	jsObfuscatorOpts = [];
	console.log("Enabling developer mode");
}

// Directory where the webcontent of each platform should be placed
var platformWebDir = {
	"android" : "platforms/android/assets/",
	"ios" : "platforms/ios/"
};

// File we want to obfuscate
var obfuscateList = { 
"www/synthesis-combined.min.js" : [
	"www/base/js/utilities.js",
	"www/base/js/app.js",
	"www/base/js/app.config.js",
	"www/base/js/directives.js",
	"www/base/js/boot/boot.controllers.js",
	"www/base/js/settings/settings.controllers.js",
	// Base: Register
	"www/base/js/register/register.services.js",
	"www/base/js/register/register.controllers.js",
	// Base: Home
	"www/base/js/home/home.services.js",
	"www/base/js/home/home.controllers.js",
	// Base: Sync
	"www/base/js/sync/sync.services.js",
	"www/base/js/sync/sync.controllers.js",
	// Base: Services
	"www/base/js/settings/settings.services.js",
	"www/base/js/services/services.LoggerService.js",
	"www/base/js/services/services.UserService.js",
	"www/base/js/services/services.DataService.js",
	"www/base/js/services/services.SyncAPIService.js",
	// Tool: Announcements
	"www/tools/announcements/js/announcements.routes.js",
	"www/tools/announcements/js/announcements.services.js",
	"www/tools/announcements/js/announcements.controllers.js",
	// Tool: FAQ
	"www/tools/faq/js/faq.services.js",
	"www/tools/faq/js/faq.controllers.js",
	"www/tools/faq/js/faq.routes.js",
	// Tool: Welcome
	"www/tools/welcome/js/welcome.routes.js",
	"www/tools/welcome/js/welcome.services.js",
	"www/tools/welcome/js/welcome.controllers.js",
	// Tool: Forums
	"www/tools/forums/js/forums.routes.js",
	"www/tools/forums/js/forums.services.js",
	"www/tools/forums/js/forums.controllers.js",
	// Tool: Schedule
	"www/tools/schedule/js/schedule.routes.js",
	"www/tools/schedule/js/schedule.services.js",
	"www/tools/schedule/js/schedule.controllers.js",
	// Tool: Learning Units
	"www/tools/learning_units/js/learning_units.routes.js",
	"www/tools/learning_units/js/learning_units.services.js",
	"www/tools/learning_units/js/learning_units.controllers.js",
	// Tool: Resources
	"www/tools/resources/js/resources.routes.js",
	"www/tools/resources/js/resources.services.js",
	"www/tools/resources/js/resources.controllers.js"
],
"www/libs/angular/angular-combined.min.js" : [
	"www/libs/angular/angular.js",
	"www/libs/angular/angular-animate.js",
	"www/libs/angular/angular-resource.js",
	"www/libs/angular/angular-route.js",
	"www/libs/angular/angular-touch.js",
	"www/libs/angular/angular-utf8-base64.js",
	"www/libs/angular/ng-iscroll.js",
	"www/libs/angular/ui-bootstrap-tpls.min.js"
]
};


for(var pIdx in platforms){
	var platform = platforms[pIdx];
	
	// Delete original files
	for(var outputFile in obfuscateList) {
		var obfuscateFiles = obfuscateList[outputFile];
		for(var fIdx in obfuscateFiles){
			var file = obfuscateFiles[fIdx];
			file = platformWebDir[platform] + file;
			if(fs.existsSync(file)) {
				fs.unlinkSync(file);
				console.log("Deleted file " + file);
			}
			else{
				console.log("File didnt exist: " + file);
			}
		}

		// Compress all files into one file
		new compressor.minify({
			type: jsObfuscator,
			fileIn: obfuscateFiles,
			fileOut: platformWebDir[platform] + outputFile,
			options: jsObfuscatorOpts,
			callback: function(err, min){
	
			}
		});
	}
}