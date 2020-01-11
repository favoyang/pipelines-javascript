// Find package folder

const findit = require("findit2");
const path = require("path");
const relative = require("relative");

const findPackage = function(packageName, searchPath) {
  return new Promise((resolve, reject) => {
    searchPath = path.resolve(__dirname, searchPath);
    const finder = findit(searchPath);
    // eslint-disable-next-line no-unused-vars
    finder.on("file", (file, stat, stop) => {
      const basename = path.basename(file);
      if (basename == "package.json") {
        const dirname = relative(process.cwd(), path.dirname(file));
        let pkg = null;
        try {
          pkg = require(path.join(file));
        } catch (err) {
          return;
        }
        if (pkg.name != packageName) return;
        resolve({ dirname, pkg, file });
        finder.stop();
      }
    });
    finder.on("end", () => {
      reject("no valid package.json found");
    });
    finder.on("error", () => {
      reject("find package.json error");
      finder.stop();
    });
  });
};

if (require.main === module) {
  if (process.argv.length < 4) {
    console.log("Usage: node findPackage.js <pkg-name> <search-path>");
    process.exit(1);
  } else {
    findPackage(process.argv[2], process.argv[3])
      .then(x => console.log(x.dirname))
      .catch(() => {});
  }
}

module.exports = { findPackage };
