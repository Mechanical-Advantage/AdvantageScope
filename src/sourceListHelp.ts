import { ensureThemeContrast } from "./shared/Colors";
import NamedMessage from "./shared/NamedMessage";
import { SourceListConfig, SourceListOptionValueConfig } from "./shared/SourceListConfig";
import LoggableType from "./shared/log/LoggableType";

let themeCallbacks: (() => void)[] = [];

function isDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
    let messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      let message: NamedMessage = event.data;
      if (message.name !== "set-config") return;
      let config: SourceListConfig = message.data;

      // Update title
      document.title = config.title + " Help \u2014 AdvantageScope";

      // Add items
      let usedColors: string[] = [];
      config.types.forEach((typeConfig) => {
        if (!typeConfig.showDocs) return;
        let title = typeConfig.display;
        let symbol = typeConfig.symbol;

        // Get colors
        let lightColor = "#000000";
        if (typeConfig.color.startsWith("#")) {
          lightColor = typeConfig.color;
        } else {
          let colorOptionConfig = typeConfig.options.find((optionConfig) => optionConfig.key === typeConfig.color);
          if (colorOptionConfig !== undefined) {
            let i = 0;
            do {
              lightColor = colorOptionConfig.values[i].key;
              i++;
            } while (usedColors.includes(lightColor));
            usedColors.push(lightColor);
          }
        }
        let darkColor = typeConfig.darkColor !== undefined ? typeConfig.darkColor : lightColor;
        lightColor = ensureThemeContrast(lightColor, false);
        darkColor = ensureThemeContrast(darkColor, true);

        // Get source types
        let sourceTypes = typeConfig.sourceTypes;
        config.types.forEach((extraTypeConfig) => {
          if (extraTypeConfig.key.startsWith(typeConfig.key)) {
            extraTypeConfig.sourceTypes.forEach((type) => {
              if (!sourceTypes.includes(type)) {
                sourceTypes.push(type);
              }
            });
          }
        });
        sourceTypes = sourceTypes.map((type) => {
          if (Object.values(LoggableType).includes(type)) {
            return type.replaceAll("Array", "[]").toLowerCase();
          } else {
            return type;
          }
        });

        // Get parent types
        let parentTypes: string[] = [];
        if (typeConfig.childOf !== undefined) {
          config.types.forEach((extraTypeConfig) => {
            if (extraTypeConfig.parentKey === typeConfig.childOf && !parentTypes.includes(extraTypeConfig.display)) {
              parentTypes.push(extraTypeConfig.display);
            }
          });
        }

        // Get options
        let options: { name: string; values: SourceListOptionValueConfig[] }[] = typeConfig.options.map(
          (optionConfig) => {
            return {
              name: optionConfig.display,
              values: optionConfig.values
            };
          }
        );

        // Add item
        addItem(title, symbol, lightColor, darkColor, sourceTypes, parentTypes, options);
      });

      // Update when theme changes
      let lastIsDark: boolean | null = null;
      let periodic = () => {
        let newIsDark = isDark();
        if (newIsDark !== lastIsDark) {
          lastIsDark = newIsDark;
          themeCallbacks.forEach((callback) => {
            callback();
          });
        }
        window.requestAnimationFrame(periodic);
      };
      window.requestAnimationFrame(periodic);
    };
  }
});

function addItem(
  title: string,
  symbol: string,
  lightColor: string,
  darkColor: string,
  sourceTypes: string[],
  parentTypes: string[],
  options: { name: string; values: SourceListOptionValueConfig[] }[]
) {
  let typeHeader = document.createElement("div");
  typeHeader.classList.add("type-header");
  document.body.appendChild(typeHeader);

  let typeIconContainer = document.createElement("div");
  typeIconContainer.classList.add("type-icon-container");
  typeHeader.appendChild(typeIconContainer);

  let typeIcon = document.createElement("object");
  typeIcon.classList.add("type-icon");
  typeIcon.type = "image/svg+xml";
  typeIcon.data = "symbols/sourceList/" + symbol + ".svg";
  typeIconContainer.appendChild(typeIcon);
  let updateColor = () => {
    if (typeIcon.contentDocument !== null) {
      typeIcon.contentDocument.getElementsByTagName("svg")[0].style.color = isDark() ? darkColor : lightColor;
    }
  };
  typeIcon.addEventListener("load", () => {
    updateColor();
    themeCallbacks.push(updateColor);
  });

  let typeTitle = document.createElement("div");
  typeTitle.classList.add("type-title");
  typeHeader.appendChild(typeTitle);
  typeTitle.innerText = title;

  if (parentTypes.length > 0) {
    let parentWarning = document.createElement("div");
    parentWarning.classList.add("parent-warning");
    document.body.appendChild(parentWarning);
    parentWarning.innerText = "Add to existing " + makeCommaList(parentTypes.map((str) => '"' + str + '"')) + " item.";
  }

  if (options.length > 0) {
    let optionsTable = document.createElement("table");
    optionsTable.classList.add("options");
    document.body.appendChild(optionsTable);

    let optionsTableBody = document.createElement("tbody");
    optionsTable.appendChild(optionsTableBody);

    options.forEach((option) => {
      let row = document.createElement("tr");
      optionsTableBody.appendChild(row);

      let nameCell = document.createElement("td");
      row.appendChild(nameCell);
      nameCell.innerHTML = option.name + ":";

      let valuesCell = document.createElement("td");
      row.appendChild(valuesCell);
      let valueStrings = option.values.map((optionConfig) => "<span>" + optionConfig.display + "</span>");
      valuesCell.innerHTML = makeCommaList(valueStrings);
      Array.from(valuesCell.getElementsByTagName("span")).forEach((span, index) => {
        let valueKey = option.values[index].key;
        if (valueKey.startsWith("#")) {
          themeCallbacks.push(() => {
            span.style.color = ensureThemeContrast(valueKey);
          });
        }
      });
    });
  }

  let sourceTypesDiv = document.createElement("div");
  sourceTypesDiv.classList.add("source-types");
  document.body.appendChild(sourceTypesDiv);
  sourceTypesDiv.innerText = "Source" + (sourceTypes.length === 1 ? "" : "s") + ": " + makeCommaList(sourceTypes);
}

function makeCommaList(values: string[]): string {
  switch (values.length) {
    case 0:
      return "";
    case 1:
      return values[0];
    case 2:
      return values[0] + " or " + values[1];
    default:
      return [...values.slice(0, -1), "or " + values[values.length - 1]].join(", ");
  }
}
