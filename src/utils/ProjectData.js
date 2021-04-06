import {
  CLIP_TYPES,
  DEFAULT_CAPTION,
  FX_DESC,
  PARAMS_TYPES,
  TRANSFORM2D_KEYS
} from "@/utils/Global";
import { generateUUID } from "@/utils/common";

class Raw {
  constructor(raw) {
    this.raw = raw;
  }
}

class Clip extends Raw {
  constructor({ type, inPoint, duration }) {
    super(null);
    this.type = type;
    this.inPoint = inPoint;
    this.duration = duration;
  }
}
export class VideoFx extends Raw {
  constructor(desc, type = "builtin") {
    super(null);
    this.desc = desc;
    this.type = type; // 'builtin' or 'package'
    this.params = [];
  }
}
export class FxParam {
  constructor(type, key, value) {
    this.type = type;
    this.key = key;
    this.value = value;
  }
}
export class VideoClip extends Clip {
  constructor(option) {
    super({ ...option, type: CLIP_TYPES.VIDEO });
    this.id = option.id;
    this.m3u8Path = option.m3u8Path;
    this.coverUrl = option.coverUrl;
    this.url = option.url;
    this.m3u8Url = option.m3u8Url;
    this.videoType = option.videoType; // videoType是字符串，且只能是video、image
    this.orgDuration = option.orgDuration || option.duration;
    this.splitList = [
      {
        trimIn: 0,
        trimOut: option.orgDuration || option.duration, // 切割点
        captureIn: option.trimIn || 0,
        captureOut: option.trimOut || option.duration, // 选中点
        raw: null,
        videoFxs: option.videoFxs || getDefaultFx(option)
      }
    ];
    this.width = option.width; // 视频宽度
    this.height = option.height; // 视频高度
    this.aspectRatio = option.aspectRatio; // 视频宽高比
    this.motion =
      option.motion === undefined
        ? option.videoType === CLIP_TYPES.IMAGE
        : !!option.motion;
    this.thumbnails = option.thumbnails || [];
    this.title = option.title || "";
    this.uuid = option.uuid || generateUUID();
    this.volume = option.volume ?? 1;
    // 视频中音频的波形图
    // this.leftChannelUrl = option.leftChannelUrl || "";
    // this.rightChannelUrl = option.rightChannelUrl || "";
  }
}
// 根据视频原始宽高比 计算放大倍数。用于视频初始时充满liveWindow
function getDefaultFx(option) {
  if (option.notDefaultScale) return [];
  const m3u8Path = option.m3u8Path;
  if (!m3u8Path) return [];
  const { width, height } = option;
  let scale = 1;
  if (width / height > 9 / 16) {
    scale = ((16 / 9) * width) / height;
  } else {
    scale = ((9 / 16) * height) / width;
  }
  console.warn("缩放", scale, width, height);
  if (scale !== 1) {
    const transformFx = new VideoFx(FX_DESC.TRANSFORM2D);
    transformFx.params = [
      new FxParam(PARAMS_TYPES.FLOAT, TRANSFORM2D_KEYS.SCALE_X, scale || 1), // 缩放
      new FxParam(PARAMS_TYPES.FLOAT, TRANSFORM2D_KEYS.SCALE_Y, scale || 1)
    ];
    return [transformFx];
  } else return [];
}
function getType(num) {
  const temp = {
    1: "VIDEO",
    2: "AUDIO",
    3: "IMAGE"
  };
  return temp[num] || "VIDEO";
}
export class AudioClip extends Clip {
  constructor(option) {
    super({ ...option, type: CLIP_TYPES.AUDIO });
    this.id = option.id;
    this.m3u8Path = option.m3u8Path;
    this.alphaM3u8Path = option.alphaM3u8Path;
    this.coverUrl = option.coverUrl;
    this.url = option.url;
    this.alphaPath = "";
    this.m3u8Url = option.m3u8Url;
    this.alphaM3u8Url = "";
    this.trimIn = option.trimIn || 0;
    this.trimOut = option.trimOut || option.duration;
    this.orgDuration = option.duration;
    this.title = option.title || "";
    this.uuid = generateUUID();
    this.leftChannelUrl = option.leftChannelUrl || "";
    this.rightChannelUrl = option.rightChannelUrl || "";
    this.name = option.name || "";
    this.artist = option.artist || "";
    this.volume = option.volume ?? 1;
  }
}
export class CaptionClip extends Clip {
  constructor(option) {
    super({
      ...option,
      type: CLIP_TYPES.CAPTION,
      duration: option.duration || 3 * 1000000
    });
    this.styleDesc =
      option.desc || option.id || option.styleDesc || DEFAULT_CAPTION;
    this.text = option.text || option.value || CLIP_TYPES.CAPTION;
    this.fontSize = option.fontSize;
    this.scale = option.scale || 1;
    this.rotation = option.rotation || 0; // 角度
    this.uuid = option.uuid || generateUUID();
    this.packageUrl = option.packageUrl;
    this.align = option.align || "center"; // string, left/center/right
    // 前端的颜色存储为RGBA，XML内的颜色存储为#FFFFFFF, SDK使用的是NvsColor
    this.color = option.color || ""; // RGBA
    this.backgroundColor = option.backgroundColor || "";
    this.font = option.font || ""; // stringValue
    this.fontUrl = option.fontUrl || "";
    // 相对于监视器中心点的位置
    this.translationX = option.translationX || 0;
    this.translationY = option.translationY || 0;
    this.z = option.z || 0;
    this.frameWidth = option.frameWidth;
    this.frameHeight = option.frameHeight;
    this.isModule = !!option.isModule; // 是否为模板的字幕
    this.deleted = !!option.deleted; // 是否已删除
    this.outlineWidth = option.outlineWidth || 0;
    this.outlineColor = option.outlineColor || "";
  }
}
export class StickerClip extends Clip {
  constructor(option) {
    super({
      ...option,
      type: CLIP_TYPES.STICKER,
      duration: option.duration || 3 * 1000000
    });
    this.desc = option.desc || option.id;
    this.scale = option.scale || 1;
    this.rotation = option.rotation || 0;
    this.packageUrl = option.packageUrl;
    this.translationX = option.translationX || 0;
    this.translationY = option.translationY || 0;
    this.z = option.z || 0;
    this.uuid = option.uuid || generateUUID();
    this.isModule = !!option.isModule; // 是否为模板的贴纸
    this.deleted = !!option.deleted; // 是否已删除
  }
}
