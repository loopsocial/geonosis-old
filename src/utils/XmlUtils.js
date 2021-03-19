import store from "../store";
import { RGBAToHex } from "./common";
import { FX_DESC, TRANSFORM2D_KEYS } from "./Global";
import { FxParam, VideoFx, VideoClip, CaptionClip } from "@/utils/ProjectData";

// 将vuex中的数据转换格式，方便写入xml  TODO: 要合并module
function transformation() {
  const {
    videos,
    audios,
    captions,
    stickers,
    videoWidth,
    videoHeight,
    alias
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
        fx => fx.desc === FX_DESC.transform2D
      );
      let scaleX = 1,
        scaleY = 1,
        translationX = 0,
        translationY = 0;
      if (transform2D) {
        transform2D.params.map(p => {
          if (p.key === TRANSFORM2D_KEYS.scaleX) scaleX = p.value;
          if (p.key === TRANSFORM2D_KEYS.scaleY) scaleY = p.value;
          if (p.key === TRANSFORM2D_KEYS.TRANS_X) translationX = p.value;
          if (p.key === TRANSFORM2D_KEYS.TRANS_Y) translationY = p.value;
        });
      }
      videoList.push({
        inPoint: video.inPoint + item.captureIn,
        duration: item.captureOut - item.captureIn,
        trimIn: item.captureIn,
        trimOut: item.captureOut,
        videoType: item.videoType,
        scaleX,
        scaleY,
        translationX,
        translationY,
        source: {
          src: video.url,
          width: video.width,
          height: video.height,
          aspectRatio: video.aspectRatio,
          m3u8Url: video.m3u8Url
        }
      });
    });
  });
  creation.scenes = videoList.map(v => {
    // 将字幕按照 视频槽的方式进行规整
    const c = captions.reduce((res, caption) => {
      const { inPoint, duration } = caption;
      if (
        inPoint === v.inPoint ||
        (inPoint + duration <= v.duration && inPoint + duration > v.inPoint)
      ) {
        res.push({
          zValue: caption.z || 1,
          fontColor: caption.color,
          translationX: caption.translationX,
          translationY: caption.translationY,
          scaleX: caption.scale,
          scaleY: caption.scale,
          fontSize: caption.fontSize,
          frameWidth: "",
          frameHeight: "",
          duration: Math.min(v.duration, duration),
          value: caption.text,
          textXAlignment: caption.align,
          font: caption.fontUrl,
          backgroundImage: caption.backgroundImage
        });
      }
      return res;
    }, []);

    return {
      video: v,
      captions: c
      // stickers: s
    };
  });
  return creation;
}

export function writeXml(xmlPath) {
  console.log(transformation());
  const stream = new NvsXmlStreamWriter(xmlPath);
  if (!stream.open()) {
    console.error("xmlStreamWriter open failed!");
    return;
  }
  stream.writeStartDocument();
  stream.writeStartElement("dom");
  writeCreation(stream);
  stream.writeEndElement();
  stream.writeEndDocument();
  stream.close();
}
function writeCreation(stream) {
  const creation = transformation();
  console.log(JSON.stringify(creation));
  stream.writeStartElement("fw-creation");
  stream.writeAttribute("video-width", "" + creation.videoWidth);
  stream.writeAttribute("video-height", "" + creation.videoHeight);
  stream.writeAttribute("version", "" + creation.version);
  stream.writeAttribute("alias", "" + creation.alias);
  creation.scenes.map(scene => {
    writeScene(stream, scene);
  });
  stream.writeEndElement();
}
function writeScene(stream, scene) {
  stream.writeStartElement("fw-scene");
  writeVideoLayer(stream, scene.video);
  writeCaptionLayer(stream, scene.captions);
  stream.writeEndElement();
}
function writeVideoLayer(stream, video) {
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", "raw");
  // 写video标签
  stream.writeStartElement("fw-video");
  stream.writeAttribute("duration", "" + video.duration);
  stream.writeAttribute("trim-in", "" + video.trimIn);
  stream.writeAttribute("trim-out", "" + video.trimOut);
  stream.writeAttribute("scale-x", "" + video.scaleX);
  stream.writeAttribute("scale-y", "" + video.scaleY);
  stream.writeAttribute("translation-x", "" + video.translationX);
  stream.writeAttribute("translation-y", "" + video.translationY);
  // 写 source标签
  stream.writeStartElement("source");
  stream.writeAttribute("src", "" + video.source.src);
  stream.writeAttribute("width", "" + video.source.width);
  stream.writeAttribute("height", "" + video.source.height);
  stream.writeAttribute("aspect-ratio", "" + video.source.aspectRatio);
  stream.writeAttribute("m3u8-url", "" + video.source.m3u8Url);
  stream.writeEndElement(); // source

  stream.writeEndElement(); // fw-video

  stream.writeEndElement(); // fw-scene-layer
}

function writeCaptionLayer(stream, captions) {
  if (!captions.length) return;
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", "user-added");
  for (let i = 0; i < captions.length; i++) {
    writeCaption(stream, captions[i]);
  }
  stream.writeEndElement();
}
function writeCaption(stream, caption) {
  stream.writeStartElement(`fw-text`);
  stream.writeAttribute("z-value", "" + caption.zValue);
  stream.writeAttribute(
    "background-color",
    "" + RGBAToHex(caption.backgroundColor)
  );
  stream.writeAttribute("translation-x", "" + caption.translationX);
  stream.writeAttribute("translation-y", "" + caption.translationY);
  stream.writeAttribute("font-size", "" + caption.fontSize);
  stream.writeAttribute("font-color", "" + RGBAToHex(caption.fontColor));
  stream.writeAttribute("font", "" + caption.font);
  // stream.writeAttribute("frame-width", "" + 0);
  // stream.writeAttribute("frame-height", "" + 0);
  stream.writeAttribute("text-x-alignment", "" + caption.textXAlignment);
  stream.writeAttribute("scale-x", "" + caption.scaleX);
  stream.writeAttribute("scale-y", "" + caption.scaleY);
  // stream.writeAttribute("text-y-alignment", "" + caption.align);
  stream.writeAttribute("value", "" + caption.value);
  stream.writeEndElement();
  if (caption.backgroundImage) {
    stream.writeStartElement(`fw-image`);
    stream.writeAttribute("src", "" + caption.backgroundImage);
    stream.writeEndElement();
  }
}
// 读取工程的XML
export function readProjectXml(xmlPath) {
  let result;
  const stream = new NvsXmlStreamReader(xmlPath || "p.xml");
  if (!stream.open()) {
    console.error("stream open failed!");
    return;
  }
  while (!stream.atEnd() && !stream.hasError()) {
    if (stream.isStartElement() && stream.name() === "dom") {
      result = readDom(stream);
    }
    stream.readNext();
  }
  if (stream.hasError()) {
    console.error("stream has error");
  }
  stream.close();
  return result;
}
function readDom(stream) {
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
    } else if (stream.isStartElement() && stream.name() === "fw-scene") {
      const { video, captions } = readProjectScene(stream, res);
      res.videos.push(video);
      res.captions.push(...captions);
    }
    stream.readNext();
  }
  return res;
}
function readProjectScene(stream, res) {
  // TODO: 估计还好拖拽sticker
  const scene = {
    video: null,
    captions: [],
    module: {
      captions: []
    }
  };
  while (!(stream.isEndElement() && stream.name() === "fw-scene")) {
    if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      const type = stream.getAttributeValue("type");
      if (type == "raw") {
        scene.video = readProjectVideo(stream, res.videos);
      } else if (type === "module") {
        // TODO: 用户使用的模板（字幕、贴纸）
        const captions = readProjectCaptions(stream, scene.video);
        scene.module.captions.push(...captions);
      } else if (type === "user-added") {
        // TODO: 用户添加的字幕、贴纸等
        const captions = readProjectCaptions(stream, scene.video);
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
      video.trimIn = stream.getAttributeValue("trim-in") * 1;
      video.trimOut = stream.getAttributeValue("trim-out") * 1;
      const transformFx = new VideoFx(FX_DESC.TRANSFORM2D);
      transformFx.params = [
        new FxParam(
          "float",
          TRANSFORM2D_KEYS.TRANS_X,
          stream.getAttributeValue("translation-x") * 1
        ), // 偏移
        new FxParam(
          "float",
          TRANSFORM2D_KEYS.TRANS_Y,
          stream.getAttributeValue("translation-y") * 1
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
      video.m3u8Url = stream.getAttributeValue("m3u8-url");
    }
    stream.readNext();
  }
  return new VideoClip(video);
}
// 读取 fw-text/fw-image
function readProjectCaptions(stream, video) {
  const captions = [];
  while (!(stream.isEndElement() && stream.name() === "fw-scene-layer")) {
    if (stream.isStartElement() && stream.name() === "fw-text") {
      const caption = new CaptionClip({
        inPoint: video.inPoint,
        duration: stream.getAttributeValue("duration") || video.duration,
        z: stream.getAttributeValue("z-value") * 1,
        color: stream.getAttributeValue("font-color"),
        translationX: stream.getAttributeValue("translation-x") * 1,
        translationY: stream.getAttributeValue("translation-y") * 1,
        fontSize: stream.getAttributeValue("font-size") * 1,
        frameWidth: stream.getAttributeValue("frame-width"),
        frameHeight: stream.getAttributeValue("frame-height"),
        align: stream.getAttributeValue("text-x-alignment"),
        text: stream.getAttributeValue("value"),
        scale: stream.getAttributeValue("scale-x") * 1
      });
      captions.push(caption);
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
export function readModuleXml(xmlPath) {
  let result;
  const stream = new NvsXmlStreamReader(xmlPath || "t.xml");
  if (!stream.open()) {
    console.error("stream open failed!");
    return;
  }
  while (!stream.atEnd() && !stream.hasError()) {
    if (stream.isStartElement() && stream.name() === "modules") {
      result = readModules(stream);
      console.log("模板结果", result);
      break;
    }
    stream.readNext();
  }
  if (stream.hasError()) {
    console.error("stream has error");
  }

  stream.close();
  return result;
}
function readModules(stream) {
  const creations = [];
  while (!(stream.isEndElement() && stream.name() === "modules")) {
    if (stream.name() === "fw-creation" && stream.isStartElement()) {
      const creation = {};
      creation.alias = stream.getAttributeValue("alias");
      creation.id = stream.getAttributeValue("id");
      creation.scenes = readSceneList(stream);
      creations.push(creation);
    }
    stream.readNext();
  }
  return creations;
}
function readSceneList(stream) {
  const scenes = [];
  while (!(stream.isEndElement() && stream.name() === "fw-creation")) {
    if (stream.name() === "fw-scene" && stream.isStartElement()) {
      scenes.push(readScene(stream));
    }
    stream.readNext();
  }
  return scenes;
}
function readScene(stream) {
  const scene = {};
  while (!(stream.isEndElement() && stream.name() === "fw-scene")) {
    if (stream.name() === "fw-scene" && stream.isStartElement()) {
      scene.temporal = stream.getAttributeValue("temporal") || "default";
      scene.layers = [];
    } else if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      scene.layers.push(readLayer(stream));
    }
    stream.readNext();
  }
  return scene;
}

function readLayer(stream) {
  const layer = {};
  while (!(stream.isEndElement() && stream.name() === "fw-scene-layer")) {
    if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      layer.type = stream.getAttributeValue("type");
    } else if (stream.name() === "fw-video" && stream.isStartElement()) {
      layer.video = {
        scaleX: stream.getAttributeValue("scale-x") * 1,
        scaleY: stream.getAttributeValue("scale-y") * 1,
        translationX: stream.getAttributeValue("translation-x") * 1,
        translationY: stream.getAttributeValue("translation-y") * 1
      };
    } else if (stream.name() === "fw-image" && stream.isStartElement()) {
      layer.image = {
        scaleX: stream.getAttributeValue("scale-x") * 1,
        scaleY: stream.getAttributeValue("scale-y") * 1,
        translationX: stream.getAttributeValue("translation-x") * 1,
        translationY: stream.getAttributeValue("translation-y") * 1
      };
      const source = {};
      while (!(stream.isEndElement() && stream.name() === "fw-image")) {
        if (stream.name() === "source" && stream.isStartElement()) {
          const src = stream.getAttributeValue("src");
          const width = stream.getAttributeValue("width") * 1;
          const height = stream.getAttributeValue("height") * 1;
          const aspectRatio = stream.getAttributeValue("aspect-ratio");
          const m3u8Url = stream.getAttributeValue("m3u8-url");
          if (src) source.src = src;
          if (width) source.width = width;
          if (height) source.height = height;
          if (aspectRatio) source.aspectRatio = aspectRatio;
          if (m3u8Url) source.m3u8Url = m3u8Url;
        }
        stream.readNext();
      }
      if (Object.keys(source)) layer.image.source = source;
      // layer.image.source = readSource(stream);
    } else if (stream.name() === "fw-text" && stream.isStartElement()) {
      if (!Array.isArray(layer.text)) layer.text = [];
      layer.text.push({
        textXAlignment: stream.getAttributeValue("text-x-alignment"),
        font: stream.getAttributeValue("font"),
        fontSize: stream.getAttributeValue("font-size") * 1,
        fontColor: stream.getAttributeValue("font-color"),
        frameWidth: stream.getAttributeValue("frame-width"),
        frameHeight: stream.getAttributeValue("frame-height"),
        translationX: stream.getAttributeValue("translation-x") * 1,
        translationY: stream.getAttributeValue("translation-y") * 1,
        zValue: stream.getAttributeValue("z-value") * 1,
        value: stream.getAttributeValue("value")
      });
    }
    stream.readNext();
  }
  return layer;
}
