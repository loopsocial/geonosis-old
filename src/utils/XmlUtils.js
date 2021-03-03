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
