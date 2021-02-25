import { CLIP_TYPES } from "@/utils/Global";
import { generateUUID } from "@/utils/common";

class Raw {
  constructor(raw) {
    this.raw = raw;
  }
}

class Clip extends Raw {
  constructor({ type, index, inPoint, duration }) {
    super(null);
    this.index = index;
    this.type = type;
    this.raw = null;
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
    this.alphaM3u8Path = option.alphaM3u8Path;
    this.coverUrl = option.coverUrl;
    this.url = option.url;
    this.alphaPath = "";
    this.m3u8Url = option.m3u8Url;
    this.alphaM3u8Url = "";
    this.videoType = CLIP_TYPES[getType(option.mediaType)];
    this.trimIn = option.trimIn || 0;
    this.trimOut = option.trimOut || option.duration;
    this.orgDuration = option.duration;
    this.splitList = [
      {
        trimIn: 0,
        trimOut: option.trimOut || option.duration,
        captureIn: 0,
        captureOut: option.trimOut || option.duration,
        raw: null,
        videoFxs: []
      }
    ];
    this.videoFxs = [];
    this.motion = option.motion === undefined ? true : !!option.motion;
    this.thumbnails = option.thumbnails || [];
    this.title = option.title || "";
    this.uuid = generateUUID();
    this.leftChannelUrl = option.leftChannelUrl || "";
    this.rightChannelUrl = option.rightChannelUrl || "";
  }
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
  }
}
export class CaptionClip extends Clip {
  constructor(option) {
    super({
      ...option,
      type: CLIP_TYPES.CAPTION,
      duration: option.duration || 5 * 1000000
    });
    this.styleDesc = option.desc || option.id;
    this.text = option.text || CLIP_TYPES.CAPTION;
    this.fontSize = option.fontSize;
    this.scaleX = option.scaleX || 1;
    this.scaleY = option.scaleY || 1;
    this.rotation = option.rotation || 0;
    this.uuid = generateUUID();
    // 相对于监视器中心点的位置
    this.translationX = option.translationX;
    this.translationY = option.translationY;
    this.z = option.z;
  }
}
export class StickerClip extends Clip {
  constructor(option) {
    super({
      ...option,
      type: CLIP_TYPES.STICKER,
      duration: option.duration || 5 * 1000000
    });
    this.desc = option.desc || option.id;
    this.text = option.text || CLIP_TYPES.STICKER;
    this.scale = option.scale || 1;
    this.rotation = option.rotation || 0;
    this.translationX = option.translationX;
    this.translationY = option.translationY;
    this.z = option.z;
    this.uuid = generateUUID();
  }
}
