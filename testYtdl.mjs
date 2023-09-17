import ytdl from "ytdl-core";

const testUrl = "https://youtu.be/R8lg6DM11fM";

console.log('Attempting to get info & download URL for "' + testUrl + '"');
const startTime = new Date().getTime();
ytdl
  .getInfo(testUrl)
  .then((info) => {
    let format = ytdl.chooseFormat(info.formats, { quality: "highestvideo", filter: "videoonly" });
    if (format.url) {
      const endTime = new Date().getTime();
      console.log(
        "Successfully found info & download URL in " +
          ((endTime - startTime) / 1000).toFixed(2) +
          "s. Full URL shown below."
      );
      console.log("\n" + format.url + "\n");
    } else {
      console.error("Cannot find download URL. Download info shown below.");
      console.error("\n" + info + "\n");
      throw new Error();
    }
  })
  .catch((reason) => {
    console.error("Cannot get download info. Reason shown below.");
    console.error("\n" + reason + "\n");
    throw new Error();
  });
