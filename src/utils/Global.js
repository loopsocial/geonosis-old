// IndexDB内所有的资源分类, 同时也是FS内的文件目录
export const objectStores = [
  "m3u8",
  "font",
  "audio",
  "captionstyle",
  "animatedsticker",
  "compoundcaption",
  "resource"
];
export const RESOURCE = "resource";
// 资源包对应的类型
export const assetTypes = {
  captionstyle: 2,
  animatedsticker: 3,
  compoundcaption: 7
};

// 需要安装的资源
export const needInstall = Object.keys(assetTypes);

// clip类型
export const CLIP_TYPES = {
  VIDEO: "video",
  AUDIO: "audio",
  IMAGE: "image",
  CAPTION: "caption",
  STICKER: "sticker"
};
// 特效desc
export const FX_DESC = {
  TRANSFORM2D: "Transform 2D",
  MOSAIC: "Mosaic"
};
// transform 2D 特效可设参数对应的Key
export const TRANSFORM2D_KEYS = {
  TRANS_X: "Trans X", // 偏移
  TRANS_Y: "Trans Y",
  SCALE_X: "Scale X", // 缩放
  SCALE_Y: "Scale Y"
};
// 特效类型
export const FX_TYPES = {
  BUILTIN: "builtin",
  PACKAGE: "package"
};
// 特效参数的类型
export const PARAMS_TYPES = {
  STRING: "string",
  FLOAT: "float",
  BOOL: "bool",
  INT: "int",
  COLOR: "color"
};
// track 类型
export const TRACK_TYPES = {
  VIDEO: "videoTrack",
  AUDIO: "audioTrack",
  CAPTION: "captionTrack",
  STICKER: "stickerTrack"
};
export const DEFAULT_CAPTION = "4447104F-7377-478C-92A3-89FC98FDABF6"; // 默认字幕
export const DEFAULT_FONT = "Noto Sans CJK JP";
export const AUDIO_MIN_DURTAION = 1000 * 1000; // 音乐最小裁剪限制，单位微秒

// 字幕对齐方式
export const TEXT_ALIGN = {
  left: 0,
  center: 1,
  right: 2
};

// 媒体类型
export const MEDIA_TYPES = {
  1: "video",
  2: "audio",
  3: "image"
};
export const RATIO = 0.5625;

export const DURATION_LIMIT = 0.5 * 1000 * 1000;

export const ENGINE_STATE = { STREAMING_ENGINE_STATE_STOPPED: 0 };
