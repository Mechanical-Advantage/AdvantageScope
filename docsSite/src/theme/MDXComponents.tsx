// Importing the original mapper + our components according to the Docusaurus doc
import Button from "@site/src/components/Button";
import MDXComponents from "@theme-original/MDXComponents";
export default {
  // Reusing the default mapping
  ...MDXComponents,
  Button
};
