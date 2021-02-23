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
export class VideoClip extends Clip {
  constructor(option) {
    super({ ...option, type: CLIP_TYPES.VIDEO });
    this.id = option.id;
    this.m3u8Path = option.m3u8Path;
    this.alphaM3u8Path = option.alphaM3u8Path;
    this.coverUrl = option.coverUrl;
    this.path = option.path;
    this.alphaPath = "";
    this.m3u8Url = option.m3u8Url;
    this.alphaM3u8Url = "";
    this.videoType = option.mediaType || 1;
    this.trimIn = option.trimIn || 0;
    this.trimOut = option.trimOut || option.duration;
    this.orgDuration = option.duration;
    this.videoFxs = [];
    this.thumbnails = option.thumbnails || [];
    this.title = option.title || "";
    this.uuid = generateUUID();
    this.leftChannelUrl = option.leftChannelUrl || "";
    this.rightChannelUrl = option.rightChannelUrl || "";
  }
}
export class AudioClip extends Clip {
  constructor(option) {
    super({ ...option, type: CLIP_TYPES.AUDIO });
    this.id = option.id;
    this.m3u8Path = option.m3u8Path;
    this.alphaM3u8Path = option.alphaM3u8Path;
    this.coverUrl = option.coverUrl;
    this.path = option.path;
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
  }
}
