const bucket = new WeakMap();
let effectFunction = null;

const tigger = (target, key) => {
	const depMap = bucket.get(target);
	if (!depMap) return;
	const depSet = depMap.get(key);
	if (!depSet) return;
	depSet.forEach((fun) => fun());
};

const track = (target, key) => {
	if (!effectFunction) return;
	let depMap = bucket.get(target);
	if (!depMap) {
		depMap = new Map();
		bucket.set(target, depMap);
	}
	let depSet = depMap.get(key);
	if (!depSet) {
		depSet = new Set();
		depMap.set(key, depSet);
	}
	depSet.add(effectFunction);
};


export const effect = (fun) => {
	effectFunction = fun;
	fun();
	effectFunction = null;
};
/**
 * @template T
 * @param {T} target - 要代理的目标对象。
 * @returns {T} 一个代理对象。
 */
export const createProxy = (target = {}) => {
	const data = new Proxy(target, {
		get: function (target, property, receiver) {
			track(target, property);
			return Reflect.get(target, property, receiver);
		},
		set: function (target, property, value, receiver) {
			Reflect.set(target, property, value, receiver);
			tigger(target, property);
			return true;
		}
	});
	return data;
};