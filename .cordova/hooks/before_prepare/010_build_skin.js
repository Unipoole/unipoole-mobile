#!/usr/bin/env node
var exec = require('child_process').exec;
exec("lessc --yui-compress branding/bootstrap/bootstrap.less > www/libs/bootstrap/css/bootstrap.css");
exec("lessc --yui-compress branding/synthesis/synthesis.less > www/base/css/synthesis.css");