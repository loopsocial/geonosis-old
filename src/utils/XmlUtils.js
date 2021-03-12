import store from "../store";
import { RGBAToHex } from "./common";
export function writeXml(xmlPath) {
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
  stream.writeStartElement("fw-creation");
  stream.writeAttribute("video-width", "1080");
  stream.writeAttribute("video-height", "1920");
  stream.writeAttribute("version", "1");
  stream.writeAttribute("alias", "Meme-2");
  writeScene(stream);
  stream.writeEndElement();
}
function writeScene(stream) {
  stream.writeStartElement("fw-scene");
  writeVideoLayer(stream);
  writeCaptionLayer(stream);
  stream.writeEndElement();
}
function writeVideoLayer(stream) {
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", "raw");
  const videos = store.state.clip.videos;
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    video.splitList.map(({ captureIn, captureOut }) => {
      const v = {
        ...video,
        trimIn: captureIn,
        trimOut: captureOut,
        duration: captureOut - captureIn
      };
      writeVideo(stream, v);
    });
  }
  stream.writeEndElement();
}

function writeVideo(stream, video) {
  stream.writeStartElement(`fw-${video.type}`);
  stream.writeAttribute("duration", "" + video.duration);
  stream.writeAttribute("trim-in", "" + video.trimIn);
  stream.writeAttribute("trim-out", "" + video.trimOut);
  stream.writeAttribute("scale-x", "" + 1);
  stream.writeAttribute("scale-y", "" + 1);
  stream.writeAttribute("translation-x", "" + 0);
  stream.writeAttribute("translation-y", "" + 0);

  stream.writeStartElement("source");
  stream.writeAttribute("src", video.url);
  // stream.writeAttribute("width", "");
  // stream.writeAttribute("height", "");
  // stream.writeAttribute("aspect-ratio", "");
  stream.writeEndElement();

  stream.writeEndElement();
}
function writeCaptionLayer(stream) {
  stream.writeStartElement("fw-scene-layer");
  stream.writeAttribute("type", "module");
  const captions = store.state.clip.captions;
  for (let i = 0; i < captions.length; i++) {
    const caption = captions[i];
    writeCaption(stream, caption);
  }
  stream.writeEndElement();
}
function writeCaption(stream, caption) {
  stream.writeStartElement(`fw-text`);
  stream.writeAttribute("z-value", "" + caption.z);
  stream.writeAttribute("font-color", "" + RGBAToHex(caption.color));
  stream.writeAttribute(
    "background-color",
    "" + RGBAToHex(caption.backgroundColor)
  );
  stream.writeAttribute("translation-x", "" + caption.translationX);
  stream.writeAttribute("translation-y", "" + caption.translationY);
  // stream.writeAttribute("font-size", "" + caption.fontSize);
  // stream.writeAttribute("frame-width", "" + 0);
  // stream.writeAttribute("frame-height", "" + 0);
  stream.writeAttribute("text-x-alignment", "" + caption.align);
  // stream.writeAttribute("text-y-alignment", "" + caption.align);
  stream.writeAttribute("value", "" + caption.text);
  stream.writeAttribute("font", "" + caption.fontUrl);
  stream.writeEndElement();
}

export function readXml() {}
// 读取module的xml
export function readModuleXml(xmlPath) {
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
        const module = readModules(stream);
        console.log("模板结果", module);
      } else if (stream.name === "dom") {
        console.log("这是工程");
      }
    }
  }
  if (stream.hasError()) {
    console.error("stream has error");
  }

  stream.close();
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
        translationY: stream.getAttributeValue("translation-y"),
      };
      // layer.image.source = readSource(stream);
    } else if (stream.name() === "fw-text" && stream.isStartElement()) {
      layer.text = {
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
      };
    }
    stream.readNext();
  }
  console.log("解析出的layer", layer);
  return layer;
}
function readSource(stream) {
  const source = {};
  while (!(stream.isEndElement() && stream.name() === "source")) {
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
  return Object.keys(source).length ? source : null;
}
