export const throttle = (time) => {
  let lastTime = 0;
  return (fn) => {
    return (...args) => {
      const currentTime = new Date().getTime();
      if ((currentTime - lastTime) > time) {
        fn(...args);
        lastTime = currentTime;
      };
    };
  };
};

export const debounce = (fn, time) => {
  let lastTime = 0;
  return (...args) => {
    lastTime && clearTimeout(lastTime);
    lastTime = setTimeout(() => {
      fn(...args);
    }, time);
  };
};
/** 
 * @param {string} str1
 * @param {string} str2
 */
export const countCommonCharacters = (str1, str2) => {
  const set1 = new Set(str1);
  return str2.split("").reduce((count, v) => (set1.has(v) && (count += 1), count), 0);
};