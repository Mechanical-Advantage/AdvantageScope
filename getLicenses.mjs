import fs from "fs";
import path from "path";
import fetch from "node-fetch";

let licenses = [];
let packageLock = JSON.parse(fs.readFileSync("package-lock.json"));
Object.keys(packageLock.packages).forEach(async (modulePath) => {
  let moduleName = modulePath === "" ? "AdvantageScope" : modulePath.replaceAll("node_modules/", "");
  if (modulePath !== "" && !fs.existsSync(modulePath)) {
    // Module not installed
    return;
  }
  let licenseFiles = fs
    .readdirSync(modulePath === "" ? "." : modulePath)
    .filter(
      (filename) =>
        filename.toLowerCase().startsWith("license") && !filename.endsWith(".js") && !filename.endsWith(".json")
    );
  let licenseText = null;
  if (licenseFiles.length > 0) {
    // Get license text from local files
    licenseText = licenseFiles.map((filename) => fs.readFileSync(path.join(modulePath, filename))).join("\n");
  } else if (fs.existsSync(path.join(modulePath, "package.json"))) {
    // Read from package.json
    let packageJson = JSON.parse(fs.readFileSync(path.join(modulePath, "package.json")));
    let request = await fetch(
      "https://raw.githubusercontent.com/spdx/license-list-data/main/json/details/" +
        encodeURIComponent(packageJson.license) +
        ".json"
    );
    if (!request.ok) {
      console.error('Failed to get license for "' + moduleName + '"');
      return;
    }
    let spdxLicense = await request.json();
    licenseText = spdxLicense.licenseText;
  }
  if (licenseText !== null) {
    licenses.push({
      module: moduleName,
      text: licenseText
    });
  }
});

// Save JSON version
fs.writeFileSync("src/licenses.json", JSON.stringify(licenses));

// Save text version
let fullText = "";
licenses.forEach((license, index) => {
  if (index === 0) return; // AdvantageScope license already included
  if (index > 1) fullText += "\n";
  fullText += "---------- " + license.module + " ----------\n\n";
  fullText += license.text;
});
fs.writeFileSync("ThirdPartyLicenses.txt", fullText);

// Print status
console.log("Saved " + licenses.length.toString() + " licenses");
