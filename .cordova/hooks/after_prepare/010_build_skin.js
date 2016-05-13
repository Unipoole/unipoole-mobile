#!/usr/bin/env node
var less = require('less');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var AppOptions = {
	// .less file search paths
	'paths' : ["branding/synthesis", "branding/bootstrap"],
	
	// optimization level, higher is better but more volatile - 1 is a good value
	'optimization': 1,
	
	// compress?
	'compress' : true,
	
	// use YUI compressor?
	'yuicompress' : true
};


//Platforms we are busy building
var platforms = process.env.CORDOVA_PLATFORMS.split(",");
//If we are in dev mode we don't want to obfuscate
if(!!process.env.DEVELOPMENT && (process.env.DEVELOPMENT.indexOf("true") == 0)){
	console.log("Enabling developer mode");
	AppOptions.compress = false;
	AppOptions.yuicompress = false;
}

//Directory where the webcontent of each platform should be placed
var platformWebDir = {
	"android" : "platforms/android/assets/",
	"ios" : "platforms/ios/"
};

//File we want to obfuscate
var obfuscateList = { 
	"branding/synthesis/synthesis.less" : "www/base/css/synthesis.css",
	"branding/bootstrap/bootstrap.less" : "www/libs/bootstrap/css/bootstrap.css",
}

 
// Make sure a specified directory exist
var ensureDirectory = function (filepath) {
	var dir = path.dirname(filepath);
	var existsSync = fs.existsSync || path.existsSync;
	if (!existsSync(dir)) { 
		mkdirp.sync(dir);
	}
};

for(var pIdx in platforms){
	var platform = platforms[pIdx];
	for(var key in obfuscateList){
		var outFile = path.resolve(process.cwd(), platformWebDir[platform] + obfuscateList[key]);
		buildLess(key, outFile)
	}
}


function buildLess(srcFile, outputFile){

	// Load the file, convert to string
	fs.readFile(srcFile, function ( error, data ) {
		var dataString = data.toString();
		var options = {
				'paths' : AppOptions.paths,
//				'outputDir' :  + "/", 
				'optimization': AppOptions.optimization,
				'filename' : path.basename(srcFile),
				'compress' : AppOptions.compress,
				'yuicompress' : AppOptions.compress,
				'outputFile' : outputFile
		};
		ensureDirectory(options.outputFile);
		 
		// Create a parser with options, filename is passed even though its loaded
		// to allow less to give us better errors
		var parser = new less.Parser(options);
		parser.parse(dataString, function(error, cssTree){
			if(error){
				less.writeError(error, options);
				return;
			}
			 
			// Create the CSS from the cssTree
			var cssString = cssTree.toCSS({
				'compress' : options.compress,
				'yuicompress' : options.yuicompress
			});
			 
			// Write output
			fs.writeFileSync(options.outputFile, cssString, 'utf8' );
			console.log("Converted Less: '" + srcFile + "', to CSS: " + outputFile);
		});
	});
}
 
