#!/usr/bin/env node
var path = require("path");
var fs = require("fs");
var fse = require("fs-extra");
var static = require('node-static');
var sass = require("node-sass");
var eyeglass = require("eyeglass");
var rootDir = __dirname;
var assetsDir = path.join(rootDir, "assets");
var buildDir = path.join(rootDir, "dist");
var inFile = path.join(rootDir, "assets", "scss", "app.scss")
var outFile = path.join(rootDir, "dist", "css", "app.css")

var options = {
  file: inFile
}

options.eyeglass = {
  root: rootDir,

  // where assets are installed by eyeglass to expose them according to their output url.
  // If not provided, assets are not installed unless you provide a custom installer.
  buildDir: path.join(rootDir, "dist"),

  assets: {
    // prefix to give assets for their output url.
    httpPrefix: "assets",

    // Add assets except for js and sass files
    // The url passed to asset-url should be
    // relative to the assets directory specified.
    sources: [
      {directory: assetsDir, globOpts: { ignore: ["**/*.js", "**/*.scss"] }}
    ]
  }
}

fse.mkdirsSync(buildDir);
fse.mkdirsSync(path.dirname(outFile));

fse.copySync(path.join(assetsDir, "html", "index.html"), path.join(buildDir, "index.html"));

// Standard node-sass rendering of a single file.
sass.render(eyeglass(options), function(err, result) {
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
