import { umamusumeData } from "../json/jp/umamusume-data.js";
import { characters } from "../json/jp/character.js";
import { characterHiddenEvents } from "../json/jp/characterHiddenEvents.js";
import { createProxy } from "./proxy.js";

/** 
 * @typedef {import("../types.js").EventType} EventType
 * @typedef {import("../types.js").EventAndSkillData} EventAndSkillData
 * @typedef {import("../types.js").HiddenEvent} HiddenEvent
 */
/** 
 * @typedef {{
 * character: EventType;
 * support: EventType;
 * main: EventType;
 * latestUpdateed: number
 * }} EventData
 */

/** @type {EventData} */
export const eventData = {
  character: undefined,
  support: [...new Set(umamusumeData.support)],
  main: umamusumeData.main,
  latestUpdateed: umamusumeData.latestUpdateed
};
/** @type {{value:typeof characters[0];hidden:HiddenEvent}} */
export const character = createProxy({
});
/** @type {EventAndSkillData} */
export const eventAndSkillData = createProxy({
});

/** @type {{currentRecognizeText: string; correctList:[string, string][]}} */
export const correctEvent = createProxy({
  currentRecognizeText: "",
  correctList: []
});

/** @param { typeof characters[0] } value */
export const updateCharacter = (value) => {
  eventData.character = umamusumeData.character[value.name];
  character.value = value;
  character.hidden = characterHiddenEvents[value.name];
};

/** @param {EventAndSkillData} data */
export const updateEventAndSkillData = (data) => {
  if (data.event === eventAndSkillData.event) return;
  eventAndSkillData.event = data.event;
  eventAndSkillData.skills = data.skills;
};


/** @param {string} name */
export const addCorrectEvent = (name) => {
  if (!name || !correctEvent.currentRecognizeText || correctEvent.correctList.find(([t, v]) => correctEvent.currentRecognizeText === t)) return;
  correctEvent.correctList = [...correctEvent.correctList, [correctEvent.currentRecognizeText, name]];
};

/** @param {string} text */
export const updateCurrentRecognizeText = (text) => {
  correctEvent.currentRecognizeText = text;
};