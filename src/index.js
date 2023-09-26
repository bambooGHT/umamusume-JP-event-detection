import { initUmamusumeList, initUpdateDOM } from "./init/index.js";
import { DetectText } from "./detectText.js";
import { selectWindow } from "./selectWindow.js";
import { getEventAndSkillData } from "./getEventData.js";
import { updateEventAndSkillData, updateCurrentRecognizeText } from "./data/index.js";
import { loadConfig } from "./config.js";

export * from "./config.js";

let isLoad = true;
export const detectText = new DetectText();

(async () => {
  loadConfig();
  initUmamusumeList();
  initUpdateDOM();
  await detectText.initWorker();
  isLoad = false;
  document.getElementById("load").innerText = "";
})();

export const initWindowAndDetectEvent = async () => {
  if (isLoad) {
    alert("loading...");
    return;
  }

  const videoElement = await selectWindow({ video: true, audio: false });
  const updateData = (value) => {
    const { text, data } = getEventAndSkillData(value);
    updateEventAndSkillData(data);
    updateCurrentRecognizeText(text);
  };

  detectText.init(videoElement, updateData);
};