import download from "download";

const FILENAME = "eng.traineddata.gz";
const URL = "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/" + FILENAME;

await download(URL, process.cwd(), { filename: FILENAME });
