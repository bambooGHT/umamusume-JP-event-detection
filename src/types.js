import { umamusumeData } from "./json/jp/umamusume-data.js";
import { eventData } from "./data/index.js";
export { };

/**
 * @typedef {typeof umamusumeData.support} EventType
 * @typedef { { condition:string; value:string }[] } HiddenEvent
 * @typedef {{event:typeof eventData.main[0]; skills:UmamusumeSkill[]}} EventAndSkillData
 * @typedef {Object} UmamusumeSkill - 
 * @property {string} name - 名字
 * @property {number} rarity - 稀有度
 * @property {number} iconId - 图标Id
 * @property {string} tactics - 要求跑法
 * @property {string} distance - 要求距离
 * @property {string} racecourse - 要求马场
 * @property {string} needSkillPoint - 需要技能点
 * @property {string} time - 効果時間
 * @property {string} coolTime - 冷却时间
 * @property {string} effect - 效果
 * @property {string} condition - 触发条件
 * @property {string} rank1 - 排名条件1 (9马娘)
 * @property {string} rank2 - 排名条件2 (12马娘)
 * @property {{
 *  type: string;
 *  value: string;
 *  target: string;
 *  targetRange: string;
 * }[]} values - 效果值
 */