import download from "download";
import fs from "fs";
import gunzipFile from "gunzip-file";

const FILENAME_GZIP = "eng.traineddata.gz";
const FILENAME = "eng.traineddata";
const URL = "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/" + FILENAME_GZIP;

// Download gzip
await download(URL, process.cwd(), { filename: FILENAME_GZIP });

// Unzip gzip
await new Promise((resolve) => {
  gunzipFile(FILENAME_GZIP, FILENAME, resolve);
});

// Delete gzip
fs.unlinkSync(FILENAME_GZIP);
