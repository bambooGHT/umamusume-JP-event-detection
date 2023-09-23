import { correctEvent } from "./data/index.js";
import { detectText } from "./index.js";

export const updateEventElementWidth = (e) => {
  const eventDOM = document.getElementById("event");
  const w = eventDOM.clientWidth;
  const X = e.x;
  document.onpointermove = (e1) => {
    const x = e1.x - X;
    eventDOM.style.width = `${w + x}px`;
  };
  document.onpointerup = () => {
    document.onpointermove = null;
    document.onpointerup = null;
  };
};

export const loadConfig = () => {
  let config = localStorage.getItem("config");
  if (config) {
    config = JSON.parse(config);
    const eventDOM = document.getElementById("event");
    const selectElement = document.getElementById("interval");
    const selectElementList = selectElement.querySelectorAll("option");

    eventDOM.style.width = config.eventDOMWidth;
    detectText.updatedDetectInterval(config.timedetectInterval);
    selectElementList.forEach((p) => {
      if (+p.value === config.timedetectInterval) {
        p.selected = true;
      }
    });
    if (config.correctList[0]) correctEvent.correctList = config.correctList;
  }
  document.body.style.display = "flex";
};

const saveConfig = (timedetectInterval = 500) => {
  const eventWidth = document.getElementById("event").clientWidth;
  const data = {
    eventDOMWidth: `${eventWidth || 450}px`,
    timedetectInterval,
    correctList: correctEvent.correctList
  };
  localStorage.setItem("config", JSON.stringify(data));
};

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    saveConfig(detectText.detectInterval);
  }
});