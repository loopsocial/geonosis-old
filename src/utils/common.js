export function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}
export function getNameFromUrl(url) {
  return url
    .split("/")
    .pop()
    .split("?")
    .shift();
}
// 微秒转字符串的时间
export function us2time(us) {
  const s = parseInt(us / 1000000);
  const min = parseInt(s / 60);
  const h = parseInt(min / 60);
  const f = v => (v > 9 ? v : `0${v}`);
  return `${f(h)}:${f(min - h * 60)}:${f(s - min * 60)}`;
}
