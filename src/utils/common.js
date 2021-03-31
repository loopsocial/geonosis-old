// 小数转百分数
export function toPercentage(number, fixed = 2) {
  number = number * 100;
  if (fixed) {
    number = number.toFixed(2);
  }
  return number + "%";
}
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

export function RGBAToNvsColor(rgbaValue) {
  if (!rgbaValue) {
    return new NvsColor(1, 1, 1, 0);
  }
  var rgba = rgbaValue.match(/(\d(\.\d+)?)+/g);
  return new NvsColor(
    parseInt(rgba[0]) / 255.0,
    parseInt(rgba[1]) / 255.0,
    parseInt(rgba[2]) / 255.0,
    parseInt(rgba[3]) / 1.0
  );
}
export function NvsColorToRGBA(color) {
  let r = Math.round(color.r * 255);
  let g = Math.round(color.g * 255);
  let b = Math.round(color.b * 255);
  let a = color.a;
  // console.log('NvsColorToRGBA', 'rgb(' + r + ',' + g + ',' + b + ',' + a + ')')
  return `rgb(${r}, ${g}, ${b}, ${a})`;
}
export function RGBAToHex(rgbaValue) {
  if (rgbaValue === "" || rgbaValue === null || rgbaValue === undefined) {
    return "";
  }
  var rgba = rgbaValue.match(/(\d(\.\d+)?)+/g);
  var r = parseInt(rgba[0]);
  var g = parseInt(rgba[1]);
  var b = parseInt(rgba[2]);
  var a = parseInt(rgba[3] * 255);
  var hex =
    "#" +
    a.toString(16) +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  return hex;
}
export function HexToRGBA(hexValue) {
  if (hexValue === "" || hexValue === null || hexValue === undefined) {
    return "";
  }
  var RGBA =
    "rgba(" +
    parseInt("0x" + hexValue.slice(3, 5)) +
    "," +
    parseInt("0x" + hexValue.slice(5, 7)) +
    "," +
    parseInt("0x" + hexValue.slice(7, 9)) +
    "," +
    parseInt("0x" + hexValue.slice(1, 3)) / 255.0 +
    ")";
  return RGBA;
}

// 获取字幕实例的重点
export function getCaptionCenter(captionRaw) {
  const vertices = captionRaw.getBoundingRectangleVertices();
  const p1 = vertices.get(0);
  // const p2 = vertices.get(1);
  const p3 = vertices.get(2);
  // const p4 = vertices.get(3);
  return {
    x: (p1.x + p3.x) / 2,
    y: (p3.y + p1.y) / 2
  };
}

// base64转字符串
export function base64ToString(data) {
  /** Convert Base64 data to a string */
  var toBinaryTable = [
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    62,
    -1,
    -1,
    -1,
    63,
    52,
    53,
    54,
    55,
    56,
    57,
    58,
    59,
    60,
    61,
    -1,
    -1,
    -1,
    0,
    -1,
    -1,
    -1,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    -1,
    -1,
    -1,
    -1,
    -1,
    -1,
    26,
    27,
    28,
    29,
    30,
    31,
    32,
    33,
    34,
    35,
    36,
    37,
    38,
    39,
    40,
    41,
    42,
    43,
    44,
    45,
    46,
    47,
    48,
    49,
    50,
    51,
    -1,
    -1,
    -1,
    -1,
    -1
  ];
  var result = "";
  var leftbits = 0;
  var leftdata = 0;
  for (var i = 0; i < data.length; i++) {
    var c = toBinaryTable[data.charCodeAt(i) & 0x7f];
    var padding = data.charCodeAt(i) == "=".charCodeAt(0);
    if (c == -1) continue;
    leftdata = (leftdata << 6) | c;
    leftbits += 6;
    if (leftbits >= 8) {
      leftbits -= 8;
      if (!padding)
        result += String.fromCharCode((leftdata >> leftbits) & 0xff);
      leftdata &= (1 << leftbits) - 1;
    }
  }
  if (leftbits) console.error("base64解析失败");
  return result;
}
