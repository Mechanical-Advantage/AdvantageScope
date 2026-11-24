// Copyright (c) 2021-2026 Littleton Robotics
// http://github.com/Mechanical-Advantage
//
// Use of this source code is governed by a BSD
// license that can be found in the LICENSE file
// at the root directory of this project.

// Custom rehype plugin to append language query parameters to YouTube iframe embeds
const youtubeLocaleRehypePlugin = () => {
  return (tree: any) => {
    const traverse = (node: any) => {
      if (
        (node.type === "element" && node.tagName === "iframe") ||
        ((node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") && node.name === "iframe")
      ) {
        let srcAttr: string | undefined;
        let attrObj: any = null;

        if (node.type === "element") {
          srcAttr = node.properties && node.properties.src;
        } else if (node.attributes) {
          attrObj = node.attributes.find((a: any) => a.type === "mdxJsxAttribute" && a.name === "src");
          if (attrObj && typeof attrObj.value === "string") {
            srcAttr = attrObj.value;
          }
        }

        if (
          typeof srcAttr === "string" &&
          (srcAttr.includes("youtube.com/embed/") || srcAttr.includes("youtube-nocookie.com/embed/"))
        ) {
          const envLocale = process.env.DOCUSAURUS_CURRENT_LOCALE;
          const locale = envLocale && envLocale !== "undefined" ? envLocale : "en-US";
          let lang = locale;
          if (locale.startsWith("es-")) {
            lang = "es";
          } else if (locale.startsWith("pt-")) {
            lang = "pt";
          } else if (locale.startsWith("en-")) {
            lang = "en";
          }

          if (lang !== "en") {
            let modifiedSrc = srcAttr;
            try {
              const url = new URL(srcAttr);
              url.searchParams.set("hl", lang);
              url.searchParams.set("cc_lang_pref", lang);
              url.searchParams.set("cc_load_policy", "1");
              modifiedSrc = url.toString();
            } catch (e) {
              if (!srcAttr.includes("?")) {
                modifiedSrc = `${srcAttr}?hl=${lang}&cc_lang_pref=${lang}&cc_load_policy=1`;
              } else if (!srcAttr.includes("hl=")) {
                modifiedSrc = `${srcAttr}&hl=${lang}&cc_lang_pref=${lang}&cc_load_policy=1`;
              }
            }

            if (node.type === "element" && node.properties) {
              node.properties.src = modifiedSrc;
            } else if (attrObj) {
              attrObj.value = modifiedSrc;
            }
          }
        }
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(tree);
  };
};

export default youtubeLocaleRehypePlugin;
