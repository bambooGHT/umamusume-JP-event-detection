/**
 * @typedef {import("./types.js").UmamusumeSkill} UmamusumeSkill
 * @typedef {import("./types.js").EventAndSkillData} EventAndSkillData
 */

import { umamusumeSkills } from "./json/jp/umamusume-skill.js";
import { countCommonCharacters } from "./utils.js";
import { eventData, correctEvent } from "./data/index.js";

const oldData = {
  text: "",
  /** @type { EventAndSkillData } */
  data: {}
};
/**
 * @param { string } value 
 * @returns { {data:EventAndSkillData;text:string} }
 */
export const getEventAndSkillData = (value) => {
  const [key, text] = formatText(value);

  if (!key) {
    oldData.text = "";
    oldData.data = {};
    return oldData;
  }

  if (oldData.text === text ||
    (oldData.text.length > 3 && countCommonCharacters(oldData.text, text) >= oldData.text.length - 2)) {
    return oldData;
  }

  const event = findCorrectedEvent(key, text) || findEvent(key, text);

  if (event) {
    const skills = extractEventSkills(event);
    oldData.text = text;
    oldData.data = { event, skills };
    console.log(`
    key:   ${key}
    value: ${text}
    `);
  } else {
    oldData.data = {};
  }

  oldData.text = text;
  return oldData;
};

/** 
 * @param { "main" | "support" | "character" } key
 * @param { string } text
 */
const findCorrectedEvent = (key, text) => {
  const value = correctEvent.correctList.find(([v]) => {
    return text === v || countCommonCharacters(v, text) >= v.length - 1;
  });

  if (value) return eventData[key].find(p => p.name === value[1]);
};

/**
 * @param {eventData["support"][0]} event
 * @returns {UmamusumeSkill[]}
 */
const extractEventSkills = (event) => {
  const skills = event.choices.reduce((result, value) => {
    value.t.match(/(?<=『).*?(?=』)/g)?.forEach((id) => {
      const value = umamusumeSkills[id];
      if (value) result.add(value);
    });
    return result;
  }, new Set());

  return [...skills];
};

/** 
 * @param { "main" | "support" | "character" } key
 * @param { string } text
 */
const findEvent = (key, text) => {
  const [min, max] = [text.length - 4, text.length + 3];
  const data = { len: 0, value: null };

  const result = eventData[key].find((item) => {
    if (item.nameLength < min || item.nameLength > max) return;
    if (text === item.name) return item;

    const count = countCommonCharacters(item.name, text);
    if (count > data.len && count >= Math.ceil(item.nameLength / 2)) {
      data.len = count;
      data.value = item;
    }
  });

  return result || data.value;
};

/**
 * @param {string} value
 * @returns {["main" | "support" | "character",string]}
 */
const formatText = (value) => {
  if (!value) return [];

  let [eventKey, text] = value.split("\n");
  eventKey = replaceName(eventKey, replaceKeys);
  const eventIndex = eventKeys.find(p => countCommonCharacters(p.id, eventKey) > 3);
  if (!eventIndex) {
    return [];
  }

  const replaceText = replaceName(text, replaceValues);

  return [eventIndex.key, replaceText];
};
const replaceName = (text, replaces) => {
  return replaces.reduce((result, [v1, v2]) => {
    result = result.replaceAll(v1, v2);
    return result;
  }, text);
};
const eventKeys = [
  {
    id: "メインシナリオ",
    key: "main"
  },
  {
    id: "サポートカート",
    key: "support"
  },
  {
    id: "育成ウマ娘",
    key: "character"
  }
];

const replaceKeys = [
  ["青", "育"], ["婦", "娘"], ["嬉", "娘"]
];

const replaceValues = [
  ["①", "1"], ["...", "…"], [".", ""],
  ["“", `"`], ["”", `"`], ["丿", "！"],
];