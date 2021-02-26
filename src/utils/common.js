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
// 微妙字符串只显示分秒
export function us2hm(us) {
  const s = parseInt(us / 1000000);
  const min = parseInt(s / 60);
  const h = parseInt(min / 60);
  const f = v => (v > 9 ? v : `0${v}`);
  return `${f(min - h * 60)}:${f(s - min * 60)}`;
}
// uuid
export function generateUUID() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";
  var uuid = s.join("");
  return uuid;
}
/**
 * 计算旋转后的位置
 * @param {object} origin 旋转中心 {x, y}
 * @param {number} angle 旋转角 弧度
 * @param {object} vector 要旋转的点 {x, y}
 */
export function vectorRotate(vector, angle, origin = { x: 0, y: 0 }) {
  let cosA = Math.cos(angle);
  let sinA = Math.sin(angle);
  var x1 = (vector.x - origin.x) * cosA - (vector.y - origin.y) * sinA;
  var y1 = (vector.x - origin.x) * sinA + (vector.y - origin.y) * cosA;
  return {
    x: origin.x + x1,
    y: origin.y + y1
  };
}
