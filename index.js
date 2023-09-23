import { initWindowAndDetectEvent, detectText, updateEventElementWidth } from "./src/index.js";
import { eventData } from "./src/data/index.js";

/** @param {InputEvent} e */
document.getElementById("interval").onchange = (e) => {
  detectText.updatedDetectInterval(+e.target.value);
};

document.getElementById("selectWindow").onclick = initWindowAndDetectEvent;

/** @param {{target:HTMLDivElement}} e */
document.getElementById("detect").onclick = (e) => {
  if (!detectText.videoElement) {
    alert("window not selected yet");
    return;
  }
  if (!eventData.character) {
    alert("umamusume not selected yet");
    return;
  }

  e.target.classList.toggle("select-is");
  detectText.toggle();
};

/** @type {HTMLDivElement} */
const modifyDOM = document.querySelector(".modify-width");
modifyDOM.onpointerdown = updateEventElementWidth;