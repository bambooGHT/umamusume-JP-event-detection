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

  if (!key || !text) {
    return { text: "", data: {} };
  }

  if (oldData.text === text ||
    (oldData.text.length > 3 && countCommonCharacters(oldData.text, text) >= oldData.text.length - 1)) {
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

  if (!value) return undefined;
  return eventData[key].find(p => p.name === value[1]);
};

/**
 * @param {eventData["support"][0]} event
 * @returns {UmamusumeSkill[]}
 */
const extractEventSkills = (event) => {
  const skills = event.choices.reduce((result, value) => {
    value.t.match(/(?<=『).*?(?=』)/g)?.forEach((id) => {
      if (umamusumeSkills[id]) result.add(umamusumeSkills[id]);
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
  const textLen = text.length;
  let data = { len: 0, value: null, isGt: false };
  const result = eventData[key].find((item) => {
    if (Math.abs(item.nameLength - textLen) > 3) return;
    if (text === item.name) return item;

    const count = countCommonCharacters(item.name, text);
    if (count > data.len && count >= Math.ceil(item.nameLength / 2)) {
      if (data.isGt) return item;
      data.len = count;
      data.value = item;
      data.isGt = true;
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

  const [eventKey, text] = value.split("\n");
  const eventIndex = eventKeys.find(p => countCommonCharacters(p.id, eventKey) > 2);
  if (!eventIndex) {
    return [];
  }
  const replaceText = replaces.reduce((result, [v1, v2]) => {
    result = result.replaceAll(v1, v2);
    return result;
  }, text);

  return [eventIndex.key, replaceText];
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

const replaces = [["①", "1"], ["...", "…"]];