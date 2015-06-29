var fs = require("fs");
var path = require("path");

var sassFile = path.join("sass", "styles.scss");
var cssFile = path.join("css", "styles.css");

var Eyeglass = require("eyeglass");
var sass = require("node-sass")
var sassOptions = {
  file : './sass/styles.scss'
};
var eyeglass = new Eyeglass(sassOptions);

// console.log("*** eyeglass: ***\n", eyeglass);

sass.render(eyeglass.sassOptions(), function(err, result) {
  if (err) throw err;

  fs.writeFile(cssFile, result.css.toString(), function(err) {
    if (err) throw err;
    console.log("css written to \'" + cssFile + "\' yay");
  })
});
