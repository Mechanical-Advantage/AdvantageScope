import { evaluate } from "mathjs";
import { GROUPED_UNITS, UnitConversionPreset } from "./shared/units";

const UNIT_TYPE = document.getElementById("unitType") as HTMLInputElement;
const FROM_UNIT = document.getElementById("fromUnit") as HTMLInputElement;
const TO_UNIT = document.getElementById("toUnit") as HTMLInputElement;
const EXTRA_FACTOR = document.getElementById("extraFactor") as HTMLInputElement;
const EXIT_BUTTON = document.getElementById("exit") as HTMLInputElement;
const CONFIRM_BUTTON = document.getElementById("confirm") as HTMLInputElement;

/** Updates the list of options based on the unit type. */
function updateUnitOptions() {
  // Clear old options
  while (FROM_UNIT.firstElementChild) {
    FROM_UNIT.removeChild(FROM_UNIT.firstElementChild);
  }
  while (TO_UNIT.firstElementChild) {
    TO_UNIT.removeChild(TO_UNIT.firstElementChild);
  }

  // Create new options
  let type = UNIT_TYPE.value;
  if (type === "none") {
    FROM_UNIT.disabled = true;
    TO_UNIT.disabled = true;

    let option = document.createElement("option");
    option.innerText = "NA";
    FROM_UNIT.appendChild(option);
    option = document.createElement("option");
    option.innerText = "NA";
    TO_UNIT.appendChild(option);
  } else {
    FROM_UNIT.disabled = false;
    TO_UNIT.disabled = false;

    Object.keys(GROUPED_UNITS[type]).forEach((unit, index) => {
      let option = document.createElement("option");
      option.innerText = unit;
      FROM_UNIT.appendChild(option);
      option = document.createElement("option");
      option.innerText = unit;
      TO_UNIT.appendChild(option);
      if (index === 1) TO_UNIT.value = unit;
    });
  }
}

window.addEventListener("message", (event) => {
  if (event.source === window && event.data === "port") {
    let messagePort = event.ports[0];
    messagePort.onmessage = (event) => {
      // Update button focus
      if (typeof event.data === "object" && "isFocused" in event.data) {
        Array.from(document.getElementsByTagName("button")).forEach((button) => {
          if (event.data.isFocused) {
            button.classList.remove("blurred");
          } else {
            button.classList.add("blurred");
          }
        });
        return;
      }

      // Normal message
      let originalConversion: UnitConversionPreset = event.data;

      // Add type options
      ["none", ...Object.keys(GROUPED_UNITS)].forEach((unitType) => {
        let option = document.createElement("option");
        option.innerText = unitType;
        UNIT_TYPE.appendChild(option);
      });
      UNIT_TYPE.addEventListener("change", () => updateUnitOptions());

      // Update values
      if (originalConversion.type === null) {
        UNIT_TYPE.value = "none";
        updateUnitOptions();
      } else {
        UNIT_TYPE.value = originalConversion.type;
        updateUnitOptions();
        FROM_UNIT.value = originalConversion.from!;
        TO_UNIT.value = originalConversion.to!;
      }
      EXTRA_FACTOR.value = originalConversion.factor.toString();

      // Close function
      function confirm() {
        // Get extra factor
        let factor = 1;
        let factorSuccess = true;
        try {
          let factorEvaluated = evaluate(EXTRA_FACTOR.value);
          if (typeof factorEvaluated === "number") {
            factor = factorEvaluated;
          } else {
            factorSuccess = false;
          }
        } catch {
          factorSuccess = false;
        }
        if (!factorSuccess) {
          alert("Failed to parse extra factor.");
          return;
        }

        // Save data
        let unitType = UNIT_TYPE.value === "none" ? null : UNIT_TYPE.value;
        let conversion: UnitConversionPreset = {
          type: unitType,
          factor: factor
        };
        if (unitType !== null) {
          conversion.from = FROM_UNIT.value;
          conversion.to = TO_UNIT.value;
        }
        messagePort.postMessage(conversion);
      }

      // Set up exit triggers
      EXIT_BUTTON.addEventListener("click", () => {
        messagePort.postMessage(originalConversion);
      });
      CONFIRM_BUTTON.addEventListener("click", confirm);
      window.addEventListener("keydown", (event) => {
        if (event.code === "Enter") confirm();
      });
    };
  }
});
