# Project Structure
This page will explain the structure of the unipoole-mobile project
REMEMBER: The application is built using cordova, you need to follow the project guidelines which cordova dictates

**Any content you place or edit within the platforms directory can, and sometimes will be replaced each time you make a build, make sure you only make code changes within the www directory in the root of the project**
 
## .cordova (hidden directory)
This directory contains scripts and node modules that are used during the build of the application - they are not packed and deployed to the mobile application.
Most important scipts here are
`hooks/after_prepare/010_build_skin.js` Used to build the unipoole mobile less files into a css file.
`hooks/after_prepare/011_obfuscate.js` Used to combine and obfuscate javascript files.

## branding
The bootstrap skin ([getbootstrap.com](http://getbootstrap.com)), and custom styles sheets are built from this directory during the build. All skins are written using the "less" language ([lesscss.org](http://lesscss.org/))
Variables are used to set commonly used colours throughout the other less files. 

## www
All application content is within this directory. All JavaScript, HTML, CSS, JSON, etc must be placed within this directory

## www/base
 This directory contains the core of the mobile application logic for unipoole mobile. Code within this directory does not contain anyhing tool specific.

## www/debug
Contains code that was used for debugging previously (THIS SHOULD BE DELETED)

## www/libs
This directory contains all 3rd party libraries that are being used by the application, angular, bootstrap, jquery, and much more


##www/tools
This directory contains nested directories for each tool. Each tool in turn will have a collection of javascript which has controllers, services, and routes. A tool will also have partials, which is the HTML that should be rendered for the tool's screens.