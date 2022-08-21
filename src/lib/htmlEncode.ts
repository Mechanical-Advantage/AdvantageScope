/** Returns the HTML encoded version of a string. */
export default function htmlEncode(text: string) {
  return text.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
    return "&#" + i.charCodeAt(0) + ";";
  });
}
