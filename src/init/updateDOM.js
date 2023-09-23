import { character, eventAndSkillData, correctEvent, addCorrectEvent, eventData } from "../data/index.js";
import { effect } from "../data/proxy.js";
import { debounce } from "../utils.js";

/**
 * @typedef {import("../types.js").EventAndSkillData["skills"]} Skills
 */

export const initUpdateDOM = () => {
  effect(updateCharacterDOM());
  effect(updateEventChoicesAndSkillDOM());
  effect(updateRecogniTextDOM());
  effect(updateCorrectEventListDOM());
  addCorrectEventDOM();

  document.getElementById("latestUpdateed").innerText = `latest updateed ${eventData.latestUpdateed}`;
};

const addCorrectEventDOM = () => {
  /** @type {HTMLInputElement} */
  const input = document.getElementById("correctEventName");
  const button = document.getElementById("addCorrectEvent");
  /** @type {HTMLUListElement} */
  const searchList = document.querySelector(".search-list");
  const eventList = [...eventData.support, ...eventData.main];

  let selectedIndex = -1;
  /** @param {{target:HTMLLIElement}} e */
  searchList.onclick = (e) => {
    input.value = e.target.innerText;
  };
  input.onblur = () => {
    selectedIndex = -1;
    document.onkeydown && (document.onkeydown = null);
  };
  input.onfocus = () => {
    document.onkeydown = (e) => {
      if (!searchList.children[0]) return;
      if (e.key === "ArrowUp") {
        selectedIndex = (selectedIndex -= 1) < 0 ? searchList.children.length - 1 : selectedIndex;
      }
      if (e.key === "ArrowDown") {
        selectedIndex = (selectedIndex += 1) > searchList.children.length - 1 ? 0 : selectedIndex;
      }
      if (e.key === "Enter") {
        input.value = searchList.children[selectedIndex].innerText;
        input.blur();
        return;
      }

      [...searchList.children].forEach((p, i) => {
        if (selectedIndex === i) p.classList.add('selected');
        else p.classList.remove('selected');
      });
    };
  };

  input.oninput = debounce((e) => {
    if (!eventData.character) return;
    /** @type {string} */
    const value = e.target.value;
    if (!value) return;
    const andCharacterEventList = [...eventData.character, ...eventList];
    searchList.innerHTML = andCharacterEventList.reduce((result, v) => {
      if (v.name.includes(value) && result.len < 7) {
        result.len += 1;
        result.text += `<li>${v.name}</li>`;
      };
      return result;
    }, { text: "", len: 0 }).text;
  }, 300);

  button.onclick = () => {
    addCorrectEvent(input.value);
    input.value = "";
  };
};

const updateRecogniTextDOM = () => {
  const t = document.querySelector(".recognize-text").querySelector("span");
  return () => {
    t.innerText = ` ${correctEvent.currentRecognizeText || null}`;
  };
};

const updateCorrectEventListDOM = () => {
  const list = document.querySelector(".correct-event-list");
  return () => {
    list.innerHTML = `${correctEvent.correctList.reduce((result, value) => {
      result += `
      <li>
        <p>${value[0]}</p>
        <span style="color: red;">=></span>
        <p>${value[1]}</p>
      </li>`;

      return result;
    }, "")}
    `;
  };
};

const updateCharacterDOM = () => {
  const characterInfo1 = document.getElementById("characterInfo");
  const characterInfo2 = document.querySelector(".character-info");
  return () => {
    characterInfo1.innerHTML = character.value ? `
      <img src="${character.value.icon}">
      <span>${character.value.name}</span>
      ` : "";
    characterInfo2.innerHTML = character.value ? `
      <li>
        <div>適性</div>
        <div>
        ${character.value.adaptability.map((item, index) => {
      return `
            <div class="aptitude${index + 1}">
              ${item.reduce((result, value) => (result += `<span>${value}</span>`, result), "")}
            </div>`;
    }).join("")}
        </div>
      </li>
      <li>
        <div>加成</div>
        <div>${character.value.attrAddition.join("")}</div>
      </li>
      <li>
        <div>みんなの評価</div>
        <div>${character.value.rating}</div>
      </li>
      ${character.hidden ? `
      <ul class="hidden-events">
        <div class="split-line">
          <i></i>
          <p>hidden event</p>
          <i></i>
        </div>
        ${character.hidden.reduce((result, p) => (result += `
        <li>
          <div>${p.condition.replace(/\n/g, '<br>')}</div>
          <div>${p.value.slice(1).replace(/\n/g, '<br>')}</div>
        </li>
        `, result), "")}
      </ul>
      ` : ""}
      ` : "";
  };
};

const updateEventChoicesAndSkillDOM = () => {
  /** @type {HTMLParagraphElement} */
  const eventName = document.querySelector(".event-name");
  const eventChoices = document.getElementById("eventChoices");
  /** @type {HTMLUListElement} */
  const skill = document.querySelector(".skills");
  return () => {
    eventName.innerText = eventAndSkillData.event?.originalName || eventAndSkillData.event?.name || "";

    eventChoices.innerHTML = eventAndSkillData.event?.choices.reduce((result, value) => {
      result += `
      <li>
        <div class="branch">${value.n}</div>
        <div class="value">${value.t}</div>
      </li>`;

      return result;
    }, "") ?? "";
    skill.innerHTML = createSkillDOM(eventAndSkillData.skills);

  };
};

/**
 * @param {Skills} skills 
 * @returns 
 */
const createSkillDOM = (skills) => {
  const text = `
  <div class="split-line"> <i></i> <p>skill (click show details)</p> <i></i> </div>`;
  return skills?.[0] ? text + `
  ${skills.reduce((result, skill) => (result += `
  <li>
    <div class="skill" tabindex="-1">
      <div class="skill-${skillRarity[skill.rarity]}">
        <img src="${getSkillUrl(skill.iconId)}">
        <div>
          <div>
            <span>${skill.name}</span>
            <span>${skill.needSkillPoint}pt</span>
          </div>
          <div></div>
          <div>${skill.effect}</div>
        </div>
      </div>
    </div>
    <ul class="skill-info">
    ${createSkillInfo(skill)}
    </ul>
  </li>`, result), "")}
  `: text;
};
/** @param {Skills[0]} skill */
const createSkillInfo = (skill) => {
  let result = skillValueName.reduce((text, [name, key]) => {
    text += `
    <li>
      <div>${name}</div>
      <div>${skill[key]}</div>
    </li>`;
    return text;
  }, "");
  result += `
  <li>
    <div>効果値</div>
    <div>
      <ul class="skill-info1">
      ${skill.values.reduce((result, value) => (result += `
      <li>
        <div style="background: ${effectValueColor[value.value.includes("-") ? "2" : "1"]};">${value.type}</div>
        <div>${value.value} | ${value.target} | ${value.targetRange}</div>
      </li> `, result), "")}
      </ul>
    </div>
  </li>
  `;
  return result;
};

const skillRarity = {
  "1": "sr",
  "2": "ssr"
};
const effectValueColor = {
  "1": `linear-gradient(-135deg,
    transparent 8px,
    var(--back-color1) 0%) top right,
  linear-gradient(-45deg,
    transparent 8px,
    var(--back-color1) 0%) bottom right`,
  "2": `linear-gradient(-135deg,
    transparent 8px,
    #9953F6 0%) top right,
  linear-gradient(-45deg,
    transparent 8px,
    #9953F6 0%) bottom right`,

};
const skillValueName = [
  ["スキル名", "name"],
  ["脚質", "tactics"],
  ["距離", "distance"],
  ["馬場", "racecourse"],
  ["pt", "needSkillPoint"],
  ["効果時間", "time"],
  ["冷却時間", "coolTime"],
  ["条件", "condition"],
  ["效果", "effect"],
  ["rank1", "rank1"],
  ["rank2", "rank2"],
];
/** @param {number} iconId */
const getSkillUrl = (iconId) => {
  return `https://kouryaku-tools.imgix.net/umamusume/images/skills/${iconId}.webp?w=96&h=96&fit=clip&auto=format`;
};