import store from "../store";
import { generateUUID, HexToRGBA, RGBAToHex } from "./common";
import {
  CLIP_TYPES,
  FX_DESC,
  TRANSFORM2D_KEYS,
  DEFAULT_CAPTION
} from "./Global";
import {
  FxParam,
  VideoFx,
  VideoClip,
  CaptionClip,
  AudioClip
} from "@/utils/ProjectData";
import { installAsset } from "./AssetsUtils";
// 将vuex中的数据转换格式，方便写入xml  TODO: 要合并module
function transformation() {
  const {
    videos,
    captions,
    stickers,
    videoWidth,
    videoHeight,
    alias,
    videoModule: module // vuex 中的模板信息以及经过转换，transformX、Y，fontSize都是直接给SDK的值
  } = store.state.clip;
  const creation = {
    scenes: [],
    videoWidth,
    videoHeight,
    version: 1,
    alias
  };
  const videoList = [];
  videos.map(video => {
    video.splitList.map(item => {
      const transform2D = item.videoFxs.find(
        fx => fx.desc === FX_DESC.TRANSFORM2D
      );
      let scaleX = 1,
        scaleY = 1,
        translationX = 0,
        translationY = 0;
      if (transform2D) {
        transform2D.params.map(p => {
          if (p.key === TRANSFORM2D_KEYS.SCALE_X) scaleX = p.value;
          if (p.key === TRANSFORM2D_KEYS.SCALE_Y) scaleY = p.value;
          if (p.key === TRANSFORM2D_KEYS.TRANS_X) translationX = p.value;
          if (p.key === TRANSFORM2D_KEYS.TRANS_Y) translationY = p.value;
        });
      }
      const vItem = {
        videoType: video.videoType,
        inPoint: video.inPoint + item.captureIn,
        duration: item.captureOut - item.captureIn,
        orgDuration: video.orgDuration,
        trimIn: item.captureIn,
        trimOut: item.captureOut,
        scaleX,
        scaleY,
        translationX,
        translationY,
        source: {
          src: video.url,
          width: video.width,
          height: video.height,
          aspectRatio: video.aspectRatio,
          m3u8Url: video.m3u8Url,
          id: video.id
        }
      };
      if (vItem.videoType) vItem.motion = video.motion;
      videoList.push(vItem);
    });
  });
  if (module) {
    creation.moduleAlias = module.alias;
  }
  creation.scenes = videoList.map((v, index) => {
    const moduleCaptions = []; // 使用的模板字幕

    // 将用户添加的字幕按照 视频槽的方式进行规整
    const c = captions.reduce((res, caption) => {
      const { inPoint, duration, isModule } = caption;
      if (
        inPoint === v.inPoint ||
        (inPoint + duration <= v.duration && inPoint + duration > v.inPoint)
      ) {
        const diff = v.inPoint - inPoint; // 处理 一个字幕横跨两个视频的情况
        const cap = {
          ...caption,
          type: isModule ? "module" : "user-added",
          zValue: caption.z || 1,
          fontColor: caption.color,
          scaleX: caption.scale,
          scaleY: caption.scale,
          duration: Math.min(v.duration, duration - diff),
          value: caption.text,
          textXAlignment: caption.align,
          font: caption.fontUrl
        };
        isModule ? moduleCaptions.push(cap) : res.push(cap);
      }
      return res;
    }, []);
    return {
      video: v,
      captions: c,
      moduleCaptions
      // stickers: s
    };
  });
  console.log("合并module后的json", creation);
  return creation;
}

export function writeXml(xmlPath) {
  // console.log(transformation());
  const stream = new NvsXmlStreamWriter(xmlPath);
  if (!stream.open()) {
    console.error("xmlStreamWriter open failed!");
    return;
  }
  stream.writeStartDocument();
  // stream.writeStartElement("dom");
  writeCreation(stream);
  // stream.writeEndElement();
  stream.writeEndDocument();
  stream.close();
}
function writeCreation(stream) {
  const creation = transformation();
  stream.writeStartElement("fw-creation");
  stream.writeAttribute("video-width", "" + creation.videoWidth);
  stream.writeAttribute("video-height", "" + creation.videoHeight);
  stream.writeAttribute("version", "" + creation.version);
  stream.writeAttribute("alias", "" + creation.alias);
  creation.moduleAlias &&
    stream.writeAttribute("module-alias", "" + creation.moduleAlias);
  creation.scenes.map(scene => {
    writeScene(stream, scene);
  });
  writeAudio(stream);
  stream.writeEndElement();
}
function writeAudio(stream) {
  const { audios } = store.state.clip;
  if (audios.length) {
    const { inPoint, trimIn, id, name, url, orgDuration } = audios[0];
    stream.writeStartElement("fw-audio");
    stream.writeAttribute("soundtrack-id", "" + id);
    stream.writeAttribute("soundtrack-name", "" + name);
    stream.writeAttribute("in-point", "" + inPoint);
    stream.writeAttribute("soundtrack-in-point", "" + trimIn);
    stream.writeAttribute("soundtrack-duration", "" + orgDuration);

    // audio source
    stream.writeStartElement("source");
    stream.writeAttribute("src", "" + url);
    stream.writeEndElement();

    stream.writeEndElement();
  }
}
function writeScene(stream, scene) {
  stream.writeStartElement("fw-scene");
  writeVideoLayer(stream, scene.video);
  writeCaptionLayer(stream, scene.captions, "user-added");
  writeCaptionLayer(stream, scene.moduleCaptions, "module");
  stream.writeEndElement();
}
function writeVideoLayer(stream, video) {
  const { videoWidth, videoHeight } = store.state.clip;
  const videoLength = Math.max(videoHeight, videoWidth);
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", "raw");
  // 写video标签
  stream.writeStartElement(`fw-${video.videoType}`);
  if (video.videoType === CLIP_TYPES.IMAGE) {
    stream.writeAttribute("motion-on", "" + !!video.motion);
  }
  stream.writeAttribute("duration", "" + video.duration);
  if (video.orgDuration) {
    stream.writeAttribute("org-duration", "" + video.orgDuration);
  }
  stream.writeAttribute("trim-in", "" + video.trimIn);
  stream.writeAttribute("trim-out", "" + video.trimOut);
  stream.writeAttribute("scale-x", "" + video.scaleX);
  stream.writeAttribute("scale-y", "" + video.scaleY);
  stream.writeAttribute("translation-x", "" + video.translationX / videoLength);
  stream.writeAttribute("translation-y", "" + video.translationY / videoLength);
  // 写 source标签
  stream.writeStartElement("source");
  const { src, width, height, aspectRatio, m3u8Url, id } = video.source;
  src && stream.writeAttribute("src", "" + src);
  width && stream.writeAttribute("width", "" + width);
  height && stream.writeAttribute("height", "" + height);
  aspectRatio && stream.writeAttribute("aspect-ratio", "" + aspectRatio);
  m3u8Url && stream.writeAttribute("m3u8-url", "" + m3u8Url);
  id && stream.writeAttribute("id", "" + id);
  stream.writeEndElement(); // source

  stream.writeEndElement(); // fw-video

  stream.writeEndElement(); // fw-scene-layer
}

function writeCaptionLayer(stream, captions, type) {
  if (!captions.length) return;
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", type || "user-added");
  for (let i = 0; i < captions.length; i++) {
    writeCaption(stream, captions[i]);
  }
  stream.writeEndElement();
}
function writeCaption(stream, caption) {
  const { videoWidth, videoHeight } = store.state.clip;
  const translationX = caption.translationX / videoWidth;
  const translationY = caption.translationY / videoHeight;
  const videoLength = Math.max(videoHeight, videoWidth);
  const fontSize = (caption.fontSize * 720) / videoLength;
  stream.writeStartElement(`fw-text`);
  if (caption.duration) {
    // 从模板应用的字幕没有duration，用户添加的字幕有duration
    stream.writeAttribute("duration", "" + caption.duration);
  }
  stream.writeAttribute("z-value", "" + caption.zValue);
  if (caption.packageUrl) {
    stream.writeAttribute("caption-style-uuid", "" + caption.packageUrl);
  }
  if (caption.backgroundColor) {
    stream.writeAttribute(
      "background-color",
      "" + RGBAToHex(caption.backgroundColor)
    );
  }
  if (caption.fontColor) {
    stream.writeAttribute("font-color", "" + RGBAToHex(caption.fontColor));
  }
  stream.writeAttribute("translation-x", "" + translationX);
  stream.writeAttribute("translation-y", "" + translationY);
  fontSize && stream.writeAttribute("font-size", "" + fontSize);
  caption.font && stream.writeAttribute("font", "" + caption.font);
  if (caption.frameWidth) {
    stream.writeAttribute("frame-width", "" + caption.frameWidth);
  }
  if (caption.frameHeight) {
    stream.writeAttribute("frame-height", "" + caption.frameHeight);
  }
  if (caption.textXAlignment) {
    stream.writeAttribute("text-x-alignment", "" + caption.textXAlignment);
  }
  // stream.writeAttribute("text-y-alignment", "" + caption.align);
  caption.scaleX && stream.writeAttribute("scale-x", "" + caption.scaleX);
  caption.scaleY && stream.writeAttribute("scale-y", "" + caption.scaleY);
  if (caption.outlineWidth) {
    stream.writeAttribute("outline-width", "" + caption.outlineWidth);
  }
  if (caption.outlineColor) {
    stream.writeAttribute(
      "outline-color",
      "" + RGBAToHex(caption.outlineColor)
    );
  }
  stream.writeAttribute("value", "" + caption.value);
  stream.writeEndElement();
  if (caption.backgroundImage) {
    stream.writeStartElement(`fw-image`);
    stream.writeAttribute("src", "" + caption.backgroundImage);
    stream.writeEndElement();
  }
}
// 读取工程的XML
export async function readProjectXml(xmlPath) {
  let result;
  const stream = new NvsXmlStreamReader(xmlPath || "p.xml");
  if (!stream.open()) {
    console.error("stream open failed!");
    return;
  }
  while (!stream.atEnd() && !stream.hasError()) {
    if (stream.isStartElement() && stream.name() === "fw-creation") {
      result = await readDom(stream);
    }
    stream.readNext();
  }
  if (stream.hasError()) {
    console.error("stream has error");
  }
  stream.close();
  return result;
}
async function readProjectAudio(stream, videos) {
  const audio = {};
  while (!(stream.isEndElement() && stream.name() === "fw-audio")) {
    if (stream.isStartElement() && stream.name() === "fw-audio") {
      audio.id = stream.getAttributeValue("soundtrack-id");
      audio.name = stream.getAttributeValue("soundtrack-name");
      audio.inPoint = stream.getAttributeValue("in-point") * 1;
      audio.trimIn = stream.getAttributeValue("soundtrack-in-point") * 1;
      audio.duration = stream.getAttributeValue("soundtrack-duration") * 1;
    } else if (stream.isStartElement() && stream.name() === "source") {
      audio.url = stream.getAttributeValue("src");
      audio.m3u8Path = await installAsset(audio.url);
    }
    stream.readNext();
  }
  return audioToAudios(audio, videos);
}
// 将xml内的audio转成vuex中的audios列表
function audioToAudios(clipOptions, videos) {
  let audios = [];
  clipOptions.trimOut = clipOptions.duration;
  const lastVideo = videos[videos.length - 1];
  const timelineDuration = lastVideo.splitList.reduce((sum, item) => {
    sum += item.captureOut - item.captureIn;
    return sum;
  }, lastVideo.inPoint);
  const clipDuration = clipOptions.orgDuration;
  if (clipOptions.inPoint > 0) {
    let durationCumulate = clipOptions.inPoint;
    const count = Math.ceil(
      (timelineDuration - clipOptions.inPoint) / clipDuration
    );
    for (let index = 0; index < count; index++) {
      durationCumulate += clipDuration;
      index >= 1 && (clipOptions.inPoint = durationCumulate);
      if (durationCumulate > timelineDuration) {
        clipOptions.trimOut =
          clipDuration - (durationCumulate - timelineDuration);
      }

      clipOptions.duration = clipOptions.trimOut - clipOptions.trimIn;
      audios.push(new AudioClip(clipOptions));
    }
  } else {
    let durationCumulate = 0;
    while (durationCumulate < timelineDuration) {
      if (durationCumulate === 0) {
        // 起始段音频 trimIn 非 0 需要单独处理
        durationCumulate = clipOptions.trimOut - clipOptions.trimIn;
        if (durationCumulate > timelineDuration) {
          clipOptions.trimOut = timelineDuration + clipOptions.trimIn;
        }
      } else {
        // 后面音频循环部分处理
        clipOptions.trimIn = 0;
        clipOptions.inPoint = durationCumulate;
        durationCumulate += clipDuration;

        if (durationCumulate > timelineDuration) {
          clipOptions.trimOut =
            clipDuration - (durationCumulate - timelineDuration);
        }
      }
      clipOptions.duration = clipOptions.trimOut - clipOptions.trimIn;
      audios.push(new AudioClip(clipOptions));
    }
  }
  return audios;
}
async function readDom(stream) {
  const res = {};
  while (!(stream.isEndElement() && stream.name() === "fw-creation")) {
    if (stream.isStartElement() && stream.name() === "fw-creation") {
      res.videoWidth = stream.getAttributeValue("video-width") * 1;
      res.videoHeight = stream.getAttributeValue("video-height") * 1;
      res.version = stream.getAttributeValue("version");
      res.alias = stream.getAttributeValue("alias");
      res.videos = [];
      res.audios = [];
      res.captions = [];
      res.stickers = [];
      res.videoModule = {
        alias: "",
        scenes: []
      };
      const moduleAlias = stream.getAttributeValue("module-alias");
      if (moduleAlias) {
        res.videoModule.alias = moduleAlias;
      }
    } else if (stream.isStartElement() && stream.name() === "fw-scene") {
      const { video, captions, videoModule } = await readProjectScene(
        stream,
        res
      );
      res.videos.push(video);
      res.captions.push(...captions);
      res.videoModule.scenes.push({
        temporal: "default",
        layers: [
          {
            type: "module",
            text: videoModule.text
          }
        ]
      });
    } else if (stream.isStartElement() && stream.name() === "fw-audio") {
      const audios = await readProjectAudio(stream, res.videos);
      res.audios = audios;
    }
    stream.readNext();
  }
  return res;
}
async function readProjectScene(stream, res) {
  // TODO: 估计还好拖拽sticker
  const scene = {
    video: null,
    captions: [],
    videoModule: {
      text: []
    }
  };
  while (!(stream.isEndElement() && stream.name() === "fw-scene")) {
    if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      const type = stream.getAttributeValue("type");
      if (type == "raw") {
        scene.video = readProjectVideo(stream, res.videos);
      } else if (type === "module") {
        // TODO: 用户使用的模板（字幕、贴纸）
        const captions = await readProjectCaptions(stream, scene.video);
        scene.videoModule.text = captions;
      } else if (type === "user-added") {
        // TODO: 用户添加的字幕、贴纸等
        const captions = await readProjectCaptions(stream, scene.video);
        scene.captions.push(...captions);
      }
    }
    stream.readNext();
  }
  return scene;
}
// 读取 fw-video
function readProjectVideo(stream, videos) {
  const pre = videos[videos.length - 1];
  const { videoWidth, videoHeight } = store.state.clip;
  const videoLength = Math.max(videoHeight, videoWidth);
  let video = {
    inPoint: pre ? pre.inPoint + pre.duration : 0
  };
  while (
    !(
      stream.isEndElement() &&
      (stream.name() === "fw-video" || stream.name() === "fw-image")
    )
  ) {
    if (
      (stream.name() === "fw-video" || stream.name() === "fw-image") &&
      stream.isStartElement()
    ) {
      video.duration = stream.getAttributeValue("duration") * 1;
      const orgDuration = stream.getAttributeValue("org-duration")
      if (orgDuration) {
        video.orgDuration = orgDuration * 1;
      }
      video.trimIn = stream.getAttributeValue("trim-in") * 1;
      video.trimOut = stream.getAttributeValue("trim-out") * 1;
      const transformFx = new VideoFx(FX_DESC.TRANSFORM2D);
      transformFx.params = [
        new FxParam(
          "float",
          TRANSFORM2D_KEYS.TRANS_X,
          stream.getAttributeValue("translation-x") * videoLength
        ), // 偏移
        new FxParam(
          "float",
          TRANSFORM2D_KEYS.TRANS_Y,
          stream.getAttributeValue("translation-y") * videoLength
        ),
        new FxParam(
          "float",
          TRANSFORM2D_KEYS.SCALE_X,
          stream.getAttributeValue("scale-x") * 1
        ), // 缩放
        new FxParam(
          "float",
          TRANSFORM2D_KEYS.SCALE_Y,
          stream.getAttributeValue("scale-y") * 1
        )
      ];
      video.videoFxs = [transformFx];
    } else if (stream.name() === "source" && stream.isStartElement()) {
      video.src = stream.getAttributeValue("src");
      video.width = stream.getAttributeValue("width");
      video.height = stream.getAttributeValue("height");
      video.aspectRatio = stream.getAttributeValue("aspect-ratio");
      video.id = stream.getAttributeValue("id");
    }
    stream.readNext();
  }
  return video;
}
// 读取 fw-text/fw-image
async function readProjectCaptions(stream, video) {
  const captions = [];
  const { videoWidth, videoHeight } = store.state.clip;
  const videoLength = Math.max(videoHeight, videoWidth);
  while (!(stream.isEndElement() && stream.name() === "fw-scene-layer")) {
    if (stream.isStartElement() && stream.name() === "fw-text") {
      const caption = {
        inPoint: video.inPoint,
        duration: (stream.getAttributeValue("duration") || video.duration) * 1,
        z: stream.getAttributeValue("z-value") * 1,
        text: stream.getAttributeValue("value"),
        translationX: stream.getAttributeValue("translation-x") * videoLength,
        translationY: stream.getAttributeValue("translation-y") * videoLength,
        scale: stream.getAttributeValue("scale-x") * 1,
        align: stream.getAttributeValue("text-x-alignment") || "center"
      };
      const fontUrl = stream.getAttributeValue("font");
      if (fontUrl) {
        caption.fontUrl = fontUrl;
        try {
          console.log("尝试安装字体");
          caption.font = await installAsset(fontUrl);
        } catch (error) {
          console.error("字体安装失败");
        }
      }
      const backgroundColor = stream.getAttributeValue("background-color");
      if (backgroundColor) {
        caption.backgroundColor = HexToRGBA(backgroundColor);
      }
      const fontColor = stream.getAttributeValue("font-color");
      if (fontColor) caption.color = HexToRGBA(fontColor);
      const fontSize = stream.getAttributeValue("font-size");
      if (fontSize) {
        caption.fontSize =
          (stream.getAttributeValue("font-size") * videoLength) / 720;
      }
      const captionStyle = stream.getAttributeValue("caption-style-uuid");
      if (captionStyle) {
        caption.packageUrl = captionStyle;
        try {
          const captionPath = await installAsset(captionStyle);
          caption.desc = captionPath
            .split("/")
            .pop()
            .split(".")
            .shift();
        } catch (error) {
          console.error("字幕安装失败 使用默认字幕", captionStyle);
        }
      }

      const frameWidth = stream.getAttributeValue("frame-width");
      if (frameWidth) caption.frameWidth = frameWidth;
      const frameHeight = stream.getAttributeValue("frame-height");
      if (frameHeight) caption.frameHeight = frameHeight;
      const outlineWidth = stream.getAttributeValue("outline-width");
      if (outlineWidth) caption.outlineWidth = outlineWidth * 1;
      const outlineColor = stream.getAttributeValue("outline-color");
      if (outlineColor) caption.outlineColor = HexToRGBA(outlineColor);
      captions.push(new CaptionClip(caption));
    } else if (stream.isStartElement() && stream.name() === "fw-image") {
      while (!(stream.isEndElement() && stream.name() === "fw-image")) {
        if (stream.isStartElement() && stream.name() === "source") {
          const caption = captions[captions.length - 1];
          caption.backgroundImage = stream.getAttributeValue("src");
        }
        stream.readNext();
      }
    }
    stream.readNext();
  }
  return captions;
}
// 读取module的xml
export async function readModuleXml(xmlPath) {
  let result;
  const stream = new NvsXmlStreamReader(xmlPath || "t.xml");
  if (!stream.open()) {
    console.error("stream open failed!");
    return;
  }
  result = await readModules(stream);
  if (stream.hasError()) {
    console.error("stream has error");
  }

  stream.close();
  return result;
}
async function readModules(stream) {
  let creation;
  while (!stream.atEnd()) {
    if (stream.name() === "fw-creation" && stream.isStartElement()) {
      creation = {};
      creation.alias = stream.getAttributeValue("alias");
      creation.id = stream.getAttributeValue("id");
      creation.scenes = await readSceneList(stream);
    }
    stream.readNext();
  }
  return creation;
}
async function readSceneList(stream) {
  const scenes = [];
  while (!(stream.isEndElement() && stream.name() === "fw-creation")) {
    if (stream.name() === "fw-scene" && stream.isStartElement()) {
      const scene = await readScene(stream);
      scenes.push(scene);
    }
    stream.readNext();
  }
  return scenes;
}
async function readScene(stream) {
  const scene = {};
  while (!(stream.isEndElement() && stream.name() === "fw-scene")) {
    if (stream.name() === "fw-scene" && stream.isStartElement()) {
      scene.temporal = stream.getAttributeValue("temporal") || "default";
      scene.layers = [];
    } else if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      const layer = await readLayer(stream);
      scene.layers.push(layer);
    }
    stream.readNext();
  }
  return scene;
}

async function readLayer(stream) {
  const layer = {};
  const { videoWidth, videoHeight } = store.state.clip;
  const videoLength = Math.max(videoHeight, videoWidth);
  while (!(stream.isEndElement() && stream.name() === "fw-scene-layer")) {
    if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      layer.type = stream.getAttributeValue("type");
    } else if (stream.name() === "fw-video" && stream.isStartElement()) {
      layer.video = {
        scaleX: stream.getAttributeValue("scale-x") * 1,
        scaleY: stream.getAttributeValue("scale-y") * 1,
        translationX: stream.getAttributeValue("translation-x") * videoLength,
        translationY: stream.getAttributeValue("translation-y") * videoLength
      };
    } else if (stream.name() === "fw-image" && stream.isStartElement()) {
      layer.image = {
        scaleX: stream.getAttributeValue("scale-x") * 1,
        scaleY: stream.getAttributeValue("scale-y") * 1,
        translationX: stream.getAttributeValue("translation-x") * videoLength,
        translationY: stream.getAttributeValue("translation-y") * videoLength
      };
      const source = {};
      if (layer.type === "module") {
        while (!(stream.isEndElement() && stream.name() === "fw-image")) {
          if (stream.name() === "source" && stream.isStartElement()) {
            const src = stream.getAttributeValue("src");
            const width = stream.getAttributeValue("width") * 1;
            const height = stream.getAttributeValue("height") * 1;
            const aspectRatio = stream.getAttributeValue("aspect-ratio");
            const m3u8Url = stream.getAttributeValue("m3u8-url");
            const id = stream.getAttributeValue("id");
            if (src) source.src = src;
            if (width) source.width = width;
            if (height) source.height = height;
            if (aspectRatio) source.aspectRatio = aspectRatio;
            if (m3u8Url) source.m3u8Url = m3u8Url;
            if (id) source.id = id;
            if (m3u8Url || src) {
              source.m3u8Path = await installAsset(m3u8Url || src, {
                isCustom: true
              });
            }
          }
          stream.readNext();
        }
      }
      if (Object.keys(source)) layer.image.source = source;
      // layer.image.source = readSource(stream);
    } else if (stream.name() === "fw-text" && stream.isStartElement()) {
      if (!Array.isArray(layer.text)) layer.text = [];
      const caption = {
        uuid: generateUUID(),
        align: stream.getAttributeValue("text-x-alignment"),
        fontSize: (stream.getAttributeValue("font-size") * videoLength) / 720,
        frameWidth: stream.getAttributeValue("frame-width"),
        frameHeight: stream.getAttributeValue("frame-height"),
        translationX: stream.getAttributeValue("translation-x") * videoLength,
        translationY: stream.getAttributeValue("translation-y") * videoLength,
        zValue: stream.getAttributeValue("z-value") * 1,
        value: stream.getAttributeValue("value")
      };
      const captionStyle = stream.getAttributeValue("caption-style-uuid");
      caption.styleDesc = DEFAULT_CAPTION;
      if (captionStyle) {
        caption.packageUrl = captionStyle;
        try {
          const captionPath = await installAsset(captionStyle);
          caption.styleDesc = captionPath.split("/").pop();
        } catch (error) {
          console.error("字幕安装失败 使用默认字幕", captionStyle);
        }
      }
      const fontUrl = stream.getAttributeValue("font");
      if (fontUrl) {
        caption.fontUrl = fontUrl;
        try {
          console.log("尝试安装字体");
          caption.font = await installAsset(fontUrl);
        } catch (error) {
          console.error("字体安装失败");
        }
      }
      let color = stream.getAttributeValue("font-color");
      if (color) {
        caption.color = HexToRGBA(color);
      }
      const backgroundColor = stream.getAttributeValue("background-color");
      if (backgroundColor) {
        caption.backgroundColor = HexToRGBA(backgroundColor);
      }
      const outlineColor = stream.getAttributeValue("outline-color");
      if (outlineColor) {
        caption.outlineColor = HexToRGBA(outlineColor);
      }
      const outlineWidth = stream.getAttributeValue("outline-width");
      if (outlineWidth) {
        caption.outlineWidth = outlineWidth * 1;
      }
      layer.text.push(new CaptionClip(caption));
    }
    stream.readNext();
  }
  return layer;
}
