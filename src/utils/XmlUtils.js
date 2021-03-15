import store from "../store";
import { RGBAToHex } from "./common";
import { FX_DESC, TRANSFORM2D_KEYS } from "./Global";
// 将vuex中的数据转换格式，方便写入xml
function transformation() {
  const creation = {
    scenes: [],
    videoWidth: 540,
    videoHeight: 960,
    version: 1,
    alias: "Meme-2"
  };
  const { videos, audios, captions, stickers } = store.state.clip;
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
          aspectRatio: video.aspectRatio
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
  stream.writeAttribute("scaleY", "" + video.scaleY);
  stream.writeAttribute("translation-x", "" + video.translationX);
  stream.writeAttribute("translation-y", "" + video.translationY);
  // 写 source标签
  stream.writeStartElement("source");
  stream.writeAttribute("src", "" + video.source.src);
  stream.writeAttribute("width", "" + video.source.width);
  stream.writeAttribute("height", "" + video.source.height);
  stream.writeAttribute("aspect-ratio", "" + video.source.aspectRatio);
  stream.writeEndElement(); // source

  stream.writeEndElement(); // fw-video

  stream.writeEndElement(); // fw-scene-layer
}

function writeCaptionLayer(stream, captions) {
  if (!captions.length) return;
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", "module");
  for (let i = 0; i < captions.length; i++) {
    writeCaption(stream, captions[i]);
  }
  stream.writeEndElement();
}
function writeCaption(stream, caption) {
  stream.writeStartElement(`fw-text`);
  stream.writeAttribute("z-value", "" + caption.zValue);
  stream.writeAttribute("font-color", "" + RGBAToHex(caption.fontColor));
  stream.writeAttribute(
    "background-color",
    "" + RGBAToHex(caption.backgroundColor)
  );
  stream.writeAttribute("translation-x", "" + caption.translationX);
  stream.writeAttribute("translation-y", "" + caption.translationY);
  // stream.writeAttribute("font-size", "" + caption.fontSize);
  // stream.writeAttribute("frame-width", "" + 0);
  // stream.writeAttribute("frame-height", "" + 0);
  stream.writeAttribute("text-x-alignment", "" + caption.textXAlignment);
  // stream.writeAttribute("text-y-alignment", "" + caption.align);
  stream.writeAttribute("value", "" + caption.value);
  stream.writeAttribute("font", "" + caption.font);
  stream.writeEndElement();
  if (caption.backgroundImage) {
    stream.writeStartElement(`fw-image`);
    stream.writeAttribute("src", "" + caption.backgroundImage);
    stream.writeEndElement();
  }
}

export function readXml() {}
// 读取module的xml
export function readModuleXml(xmlPath) {
  let result;
  const stream = new NvsXmlStreamReader(xmlPath || "t.xml");
  if (!stream.open()) {
    console.error("stream open failed!");
    return;
  }
  while (!stream.atEnd() && !stream.hasError()) {
    stream.readNext();
    if (stream.isStartDocument()) {
      continue;
    }
    if (stream.isStartElement()) {
      if (stream.name() === "modules") {
        console.log("这是模板");
        result = readModules(stream);
        console.log("模板结果", result);
      } else if (stream.name === "dom") {
        console.log("这是工程");
      }
    }
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
      console.log("creation", creation);
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
    stream.isStartElement() && console.log("循环开始", stream.name());
    if (stream.name() === "fw-scene" && stream.isStartElement()) {
      scene.temporal = stream.getAttributeValue("temporal") || "default";
      scene.layers = [];
    } else if (stream.name() === "fw-scene-layer" && stream.isStartElement()) {
      scene.layers.push(readLayer(stream));
    }
    stream.isStartElement() && console.log("循环结束", stream.name());
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
        scaleX: stream.getAttributeValue("scale-x"),
        scaleY: stream.getAttributeValue("scale-y"),
        translationX: stream.getAttributeValue("translation-x"),
        translationY: stream.getAttributeValue("translation-y")
      };
      // 模板的video没有source
      // const source = readSource(stream);
      // if (source) {
      //   layer.video.source = source;
      // }
    } else if (stream.name() === "fw-image" && stream.isStartElement()) {
      layer.image = {
        scaleX: stream.getAttributeValue("scale-x"),
        scaleY: stream.getAttributeValue("scale-y"),
        translationX: stream.getAttributeValue("translation-x"),
        translationY: stream.getAttributeValue("translation-y")
      };
      const source = {};
      while (!(stream.isEndElement() && stream.name() === "fw-image")) {
        if (stream.name() === "source" && stream.isStartElement()) {
          const src = stream.getAttributeValue("src");
          const width = stream.getAttributeValue("width");
          const height = stream.getAttributeValue("height");
          const aspectRatio = stream.getAttributeValue("aspect-ratio");
          if (src) source.src = src;
          if (width) source.width = width;
          if (height) source.height = height;
          if (aspectRatio) source.aspectRatio = aspectRatio;
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
        fontSize: stream.getAttributeValue("font-size"),
        fontColor: stream.getAttributeValue("font-color"),
        frameWidth: stream.getAttributeValue("frame-width"),
        frameHeight: stream.getAttributeValue("frame-height"),
        translationX: stream.getAttributeValue("translation-x"),
        translationY: stream.getAttributeValue("translation-y"),
        zValue: stream.getAttributeValue("z-value"),
        value: stream.getAttributeValue("value")
      });
    }
    stream.readNext();
  }
  console.log("解析出的layer", layer);
  return layer;
}
