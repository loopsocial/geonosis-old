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
