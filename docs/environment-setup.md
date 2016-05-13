#Overview
For the sake of simplicity we will explain to setup a Android development environment (iOS only differs slightly)

## Install required SDKs and tools
1. Install NodeJS http://nodejs.org/download/
  You should have the npm and node command available from your command line, if net setup your PATH environment variable to include it.
  
2. Install cordova using node package manager
  ```bash
  npm install -g cordova
  ```
  Once this is complete your should have the "cordova" command available from the command line

3. Install the Android SDK (for iPhone install xCode and the xCode command line tools)
  Download the "SDK Tools Only" package from http://developer.android.com/sdk/index.html
  Create "ANDROID_HOME" environment variable which points to the location where the sdk was installed/extracted
  Update the `PATH` environment variable to include `ANDROID_HOME/tools` and `ANDROID_HOME/platform-tools`
   
4. open the Android SDK manager ("android" from command line)
5. Install the latest of
 + Android SDK Tools
 + Android SDK Platform-tools
 + Android SDK Build-tools
 + Android 4.4.2 (API 19)
    - SDK Platform
    - ARM EBI v7 System Image
    - Google APIs (ARM System Image)
    - Sources for Android SDK
 + Extras 
    - Android Support Library
    - Google USB Driver (window)
6. Install svn version 1.7 or later. http://www.collab.net/downloads/subversion (Do not install the SVN Edge server, only the client)
   You can make sure you have the correct version of svn
  ```bash
  svn --version
  ```

7. Install Ant :
  - Make sure you have a Java environment installed, See System Requirements for details.
  - Download Ant. See Binary Edition for details.
  - Uncompress the downloaded file into a directory.
  - Set environmental variables `JAVA_HOME` to your Java environment, `ANT_HOME` to the directory you uncompressed Ant to, and add `${ANT_HOME}/bin` (Unix) or `%ANT_HOME%/bin` (Windows) to your PATH. See Setup for details.
 
At this stage you should have all the tools installed what you will need to be able to build the unipoole mobile application. Next we will get the code from svn and build it
 - Check out the mobile code from git
```bash
git clone https://github.com/Unipoole/unipoole-mobile.git
```
