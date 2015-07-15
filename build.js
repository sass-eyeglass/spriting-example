#!/usr/bin/env node
var path = require("path");
var fs = require("fs");
var fse = require("fs-extra");
var static = require('node-static');
var sass = require("node-sass");
var Eyeglass = require("eyeglass").Eyeglass;
var rootDir = __dirname;
var assetsDir = path.join(rootDir, "assets");
var buildDir = path.join(rootDir, "dist");
var inFile = path.join(rootDir, "assets", "scss", "app.scss")
var outFile = path.join(rootDir, "dist", "css", "app.css")

var options = {
  // specifying root lets the script run from any directory instead of having to be in the same directory.
  root: rootDir,
  // where assets are installed by eyeglass to expose them according to their output url.
  // If not provided, assets are not installed unless you provide a custom installer.
  buildDir: buildDir,
  // prefix to give assets for their output url.
  assetsHttpPrefix: "assets",
  // Sass file to compile.
  file: inFile,
   // always pass the output file for path resolution purposes.
  outFile: outFile
}

var eyeglass = new Eyeglass(options, sass);

// Add assets except for js and sass files
eyeglass.assets.addSource(assetsDir, {
  globOpts: { ignore: ["**/*.js", "**/*.scss", "**/*.html"] }
});

eyeglass.assets.installer(function(assetFile, assetUri, oldInstaller, cb) {
  // oldInstaller is the standard eyeglass installer in this case.
  // We proxy to it for logging purposes.
  oldInstaller(assetFile, assetUri, function(err, result) {
    if (err) {
      console.log("Error installing '" + assetFile + "': " + err.toString());
    } else {
      console.log("Installed Asset '" + assetFile + "' => '" + result + "'");
    }
    cb(err, result);
  });
});

fse.mkdirsSync(buildDir);
fse.mkdirsSync(path.dirname(outFile));

fse.copySync(path.join(assetsDir, "html", "index.html"), path.join(buildDir, "index.html"));

// Standard node-sass rendering of a single file.
sass.render(eyeglass.sassOptions(), function(err, result) {
  if (err) {
    throw err;
  }
  fs.writeFile(outFile, result.css, function(writeError) {
    if (writeError) throw writeError;
    console.log("Compiled: " + outFile);
  });
});

// serve the './dist' folder
var file = new static.Server('./dist');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8080);
