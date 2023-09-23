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
    countCommonCharacters(oldData.text, text) >= oldData.text?.length - 1) {
    return oldData;
  }

  console.log(`
  key:   ${key}
  value: ${text}
  `);

  const event = findCorrectedEvent(key, text) || findEvent(key, text);

  if (event) {
    const skills = extractEventSkills(event);
    oldData.data = { event, skills };
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
  const [value, id] = correctEvent.correctList.find(([v]) => {
    return text === v || countCommonCharacters(v, text) >= v.length - 1;
  });
  return eventData[key].find(p => p.name === id);
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
  const filterName = text.replace(/[^ぁ-んァ-ンー]/g, "");
  const filterNameLen = filterName.length;

  const value = { len: 0, data: undefined };
  const result = eventData[key].find((item) => {
    if (filterNameLen > 3 && filterName === item.filterName) return item;

    const count = countCommonCharacters(item.name, text);
    if (count > value.len && count > 3 && Math.abs(count - item.name.length) <= 3) {
      value.len = count;
      value.data = item;
    }
  });

  return result || value.data;
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

  return [eventIndex.key, text];
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
