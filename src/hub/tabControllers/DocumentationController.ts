import { Remarkable } from "remarkable";
import { TabState } from "../../shared/HubState";
import TabType from "../../shared/TabType";
import TabController from "../TabController";

export default class DocumentationController implements TabController {
  private CONTENT: HTMLElement;
  private CONTAINER: HTMLElement;
  private TEXT: HTMLElement;
  private remarkable = new Remarkable();

  constructor(content: HTMLElement) {
    this.CONTENT = content;
    this.CONTAINER = content.getElementsByClassName("documentation-container")[0] as HTMLElement;
    this.TEXT = content.getElementsByClassName("documentation-text")[0] as HTMLElement;

    this.loadMarkdown("INDEX.md");
  }

  saveState(): TabState {
    return {
      type: TabType.Documentation
    };
  }

  restoreState(state: TabState): void {}

  refresh(): void {}

  periodic(): void {}

  private loadMarkdown(markdownPath: string) {
    fetch("../docs/" + markdownPath)
      .then((response) => {
        return response.text();
      })
      .then((text) => {
        this.TEXT.innerHTML = this.remarkable.render(text);

        // Update links
        Array.from(this.TEXT.getElementsByTagName("a")).forEach((link) => {
          let url = link.href;
          link.href = "#";
          link.addEventListener("click", () => {
            if (url.startsWith("http")) {
              window.sendMainMessage("open-link", url);
            } else {
              this.loadMarkdown(url.replace("file:///", "../"));
            }
          });
        });

        // Update image URLs
        Array.from(this.TEXT.getElementsByTagName("img")).forEach((img) => {
          if (img.src.startsWith("file:///")) {
            img.src = img.src.replace("file:///", "../");
          }
        });
      });
  }
}
