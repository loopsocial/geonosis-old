import Konva from "konva";
import { CLIP_TYPES } from "@/utils/Global";
import { vectorRotate } from "@/utils/common";
import delImg from "../assets/images/delete.png";
import store from "../store/index";
export default class WorkFlow {
  constructor(options) {
    const { containerId } = options;
    this.containerId = containerId;
    this.clip = options.clip;
    this.stage = null;
    this.layer = null;
    this.node = null;
    this.rectTransform = null;
    this.deleteNode = null;
    this.timelineClass = options.timelineClass || null;
    this.initStage();
  }
  initStage() {
    if (this.stage && this.stage instanceof Konva.Stage) {
      this.stage.destroy();
    }

    if (!this.containerId) {
      console.warn("缺少容器");
      return;
    }
    const container = document.getElementById(this.containerId);
    const { clientHeight, clientWidth } = container;
    this.stage = new Konva.Stage({
      container: this.containerId,
      width: clientWidth,
      height: clientHeight
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.initRect();
  }
  async initRect() {
    const { x, y, width, height } = WorkFlow.getCoordinateFromPoint(
      this.clip,
      this.timelineClass.liveWindow
    );
    this.node = new Konva.Rect({
      x,
      y,
      width,
      height,
      strokeWidth: 0,
      draggable: true,
      dragBoundFunc: pos => {
        const absolute = this.node.absolutePosition();
        const { x: prevX, y: prevY } = absolute;
        const { x, y } = pos;
        if (x === prevX && y === prevY) {
          return pos;
        }
        const canonicalPointF = this.aTob(new NvsPointF(x, y));
        const canonicalPrevPointF = this.aTob(new NvsPointF(prevX, prevY));
        const canonicalOffsetX = canonicalPointF.x - canonicalPrevPointF.x;
        const canonicalOffsetY = canonicalPointF.y - canonicalPrevPointF.y;
        const offsetPointF = new NvsPointF(canonicalOffsetX, canonicalOffsetY);
        if (this.clip.type === CLIP_TYPES.CAPTION) {
          this.captionDrag(offsetPointF);
        } else if (this.clip.type === CLIP_TYPES.STICKER) {
          this.stickerDrag(offsetPointF);
        }
        this.timelineClass.seekTimeline();
        this.deleteNode.x(pos.x + this.node.width() / 2 - 23);
        this.deleteNode.y(pos.y + this.node.height());
        return pos;
      }
    });
    const image = await this.getImage();
    this.deleteNode = new Konva.Image({
      x: x + width / 2 - 23,
      y: y + height,
      image,
      width: 46,
      height: 46
    });
    if (this.clip.rotation !== 0) {
      this.node.offsetX(this.node.width() / 2);
      this.node.offsetY(this.node.height() / 2);
      this.node.x(this.node.x() + this.node.width() / 2);
      this.node.y(this.node.y() + this.node.height() / 2);
      this.node.rotation(-this.clip.rotation);
      this.deleteNode.rotation(-this.clip.rotation);
      this.deleteNode.x(x + width / 2);
    }
    this.layer.add(this.deleteNode);
    this.layer.add(this.node);
    window.node = this.deleteNode;
    this.rectTransform = new Konva.Transformer({
      nodes: [this.node],
      rotateEnabled: true,
      borderStrokeWidth: 1,
      borderStroke: "white",
      anchorFill: "white",
      anchorSize: 8,
      anchorStroke: "white",
      anchorCornerRadius: 4,
      rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      centeredScaling: true,
      keepRatio: true,
      rotateAnchorOffset: 20,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      boundBoxFunc: (oldBox, newBox) => {
        const { x, y, width, height } = oldBox;
        const rectCenter = { x: x + width / 2, y: y + height / 2 }; // 旋转之后的缩放中心不对
        if (this.clip.type === CLIP_TYPES.CAPTION) {
          this.captionTransformer(oldBox, newBox, rectCenter);
        } else if (this.clip.type === CLIP_TYPES.STICKER) {
          this.stickerTransformer(oldBox, newBox, rectCenter);
        }
        this.timelineClass.seekTimeline();
        // console.log('缩放旋转', newBox);
        // this.deleteNode.x(newBox.x + newBox.width / 2 - 23);
        // this.deleteNode.y(newBox.y + newBox.height);
        this.deleteNode.rotation(-newBox.rotation);
        return newBox;
      }
    });
    this.layer.add(this.rectTransform);
    this.layer.draw();
    this.setEvent();
  }
  getImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = delImg;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = reject;
    });
  }
  isInRect(point) {
    const { x, y, width, height } = WorkFlow.getCoordinateFromPoint(
      this.clip,
      this.timelineClass.liveWindow
    );
    const origin = {
      x: x + width / 2,
      y: y + height / 2
    };
    let { x: newX, y: newY } = vectorRotate(
      point,
      (this.clip.rotation / 180) * Math.PI,
      origin
    );
    point.x = newX;
    point.y = newY;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }
  static getCoordinateFromPoint(clip, liveWindow) {
    const rotation = parseInt(clip.raw.getRotationZ());
    let vertices;
    if (clip.type === CLIP_TYPES.CAPTION) {
      vertices = clip.raw.getCaptionBoundingVertices(2); // 2 表示字幕的实际边框, 0 表示字幕中的文字边框
    } else if (clip.type === CLIP_TYPES.STICKER) {
      vertices = clip.raw.getBoundingRectangleVertices();
    }
    const { i1, i2, i3, i4 } = WorkFlow.getVerticesPoint(vertices, liveWindow);
    // - 逆时针 i1, i2, i3, i4
    let x;
    let y;
    let width;
    let height;

    if (!rotation) {
      width = i3.x - i1.x;
      height = i2.y - i1.y;

      if (width > 0) {
        x = i1.x;
      } else {
        x = i3.x;
      }

      if (height > 0) {
        y = i1.y;
      } else {
        y = i2.y;
      }

      width = Math.abs(width);
      height = Math.abs(height);
    } else {
      width = Math.sqrt(Math.pow(i4.y - i1.y, 2) + Math.pow(i4.x - i1.x, 2));
      height = Math.sqrt(Math.pow(i4.x - i3.x, 2) + Math.pow(i3.y - i4.y, 2));
      const oX = i3.x + (i1.x - i3.x) / 2;
      const oY = i4.y + (i2.y - i4.y) / 2;
      x = oX - width / 2;
      y = oY - height / 2;
    }
    return {
      x,
      y,
      width,
      height,
      rotation
    };
  }
  static getVerticesPoint(vertices, liveWindow) {
    // - 逆时针
    // - ptr.get(0) 左上
    // - ptr.get(1) 左下
    // - ptr.get(2) 右下
    // - ptr.get(3) 右上
    const i1 = WorkFlow.bToa(vertices.get(0), liveWindow);
    const i2 = WorkFlow.bToa(vertices.get(1), liveWindow);
    const i3 = WorkFlow.bToa(vertices.get(2), liveWindow);
    const i4 = WorkFlow.bToa(vertices.get(3), liveWindow);

    return { i1, i2, i3, i4 };
  }
  static bToa(coordinate, liveWindow) {
    // 渲染层 to 视口层
    if (!liveWindow) {
      return;
    }
    return liveWindow.mapCanonicalToView(coordinate);
  }
  destroy() {
    if (this.stage && this.stage instanceof Konva.Stage) {
      this.stage.destroy();
    }
  }
  aTob(coordinate) {
    // 视口层 to 渲染层
    const liveWindow = this.timelineClass.liveWindow;
    if (!liveWindow) return;
    return liveWindow.mapViewToCanonical(coordinate);
  }
  captionDrag(offsetPointF) {
    this.clip.raw.translateCaption(offsetPointF);
    const targetPointF = this.clip.raw.getCaptionTranslation();
    this.clip.translationX = targetPointF.x;
    this.clip.translationY = targetPointF.y;
  }
  stickerDrag(offsetPointF) {
    this.clip.raw.translateAnimatedSticker(offsetPointF);
    const targetPointF = this.clip.raw.getTranslation();
    this.clip.translationX = targetPointF.x;
    this.clip.translationY = targetPointF.y;
  }
  captionTransformer(oldBox, newBox, rectCenter) {
    const centerPointF = new NvsPointF(rectCenter.x, rectCenter.y);
    const scaleFactorX = newBox.width / oldBox.width;
    // 缩放操作
    this.clip.raw.scaleCaption(scaleFactorX, this.aTob(centerPointF));
    this.clip.scaleX = this.clip.raw.getScaleX();
    this.clip.scaleY = this.clip.raw.getScaleY();
    // 旋转操作
    const diffRotation = oldBox.rotation - newBox.rotation;
    if (diffRotation) {
      this.clip.raw.rotateCaption2((diffRotation / Math.PI) * 180);
      this.clip.rotation = this.clip.raw.getRotationZ();
    }
    // 重新记录位置
    const targetPointF = this.clip.raw.getCaptionTranslation();
    this.clip.translationX = targetPointF.x;
    this.clip.translationY = targetPointF.y;
  }
  stickerTransformer(oldBox, newBox, rectCenter) {
    const centerPointF = new NvsPointF(rectCenter.x, rectCenter.y);
    const scaleFactorX = newBox.width / oldBox.width;
    // 缩放操作
    this.clip.raw.scaleAnimatedSticker(scaleFactorX, this.aTob(centerPointF));
    this.clip.scale = this.clip.raw.getScale();
    // 旋转操作
    const diffRotation = oldBox.rotation - newBox.rotation;
    if (diffRotation) {
      this.clip.raw.rotateAnimatedSticker(
        (diffRotation / Math.PI) * 180,
        this.aTob(centerPointF)
      );
      this.clip.rotation = this.clip.raw.getRotationZ();
    }
    // 重新记录位置
    const targetPointF = this.clip.raw.getTranslation();
    this.clip.translationX = targetPointF.x;
    this.clip.translationY = targetPointF.y;
  }
  captionInput(captionClip) {
    const captionClipRaw = captionClip.raw;
    let text = captionClipRaw.getText();
    // captionClipRaw.setText('')
    const captionColor = captionClipRaw.getTextColor();
    captionClipRaw.setTextColor(new NvsColor(0, 0, 0, 0));
    this.timelineClass.seekTimeline();

    let input = document.createElement("input");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const container = document.getElementById(this.containerId);
    const originHeight = this.rectTransform.height();
    const originWidth = this.rectTransform.width();
    const originX = this.rectTransform.x();
    const originY = this.rectTransform.y();
    input.style.position = "absolute";
    input.style.width = originWidth + "px";
    input.style.height = originHeight + "px";
    input.style.lineHeight = originHeight + "px";
    input.style.fontSize = originHeight - 8 + "px";
    input.style.left = originX + "px";
    input.style.top = originY + "px";
    input.style.zIndex = 1000;
    input.style.display = "block";
    input.style.border = 0;
    input.style.backgroundColor = "transparent";
    const { r, g, b, a } = captionColor;
    input.style.color = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    input.style.outline = 0;
    input.value = text + "";

    const rotation = this.rectTransform.rotation();
    if (rotation) {
      input.style.transform = `rotate(${rotation}deg)`;
      input.style.transformOrigin = "top left";
    }

    const calculateTranslate = diffWidth => {
      const cosValue = Math.cos((rotation / 180) * Math.PI);
      let translateX = 0;
      if (cosValue) translateX = diffWidth / cosValue;
      let translateY = parseInt(
        Math.sqrt(Math.pow(diffWidth, 2) - Math.pow(translateX, 2))
      );

      if (diffWidth < 0) translateY = -translateY;
      return {
        translateX,
        translateY
      };
    };

    const calculateRect = (preWidth, text) => {
      ctx.font = `${parseInt(input.style.fontSize)}px sans-serif`;
      const width = ctx.measureText(text).width;
      // const diffTranslate = (width - preWidth) / 2;
      // const { translateX, translateY } = calculateTranslate(diffTranslate);
      // if (translateX) {
      //   this.node.x(this.node.x() - translateX);
      //   input.style.left = this.rectTransform.x() + "px";
      // }
      // if (translateY) {
      //   this.rectTransform.y(this.rectTransform.y() - translateY);
      //   input.style.top = this.rectTransform.y() + "px";
      // }
      this.node.width(width);
      input.style.width = width + "px";
    };

    calculateRect(originWidth, text);
    const onChange = () => {
      captionClipRaw.setText(input.value + "");
      captionClip.text = captionClipRaw.getText();
      input.onfocus = null;
      input.oninput = null;
      input.onblur = null;
      input.onchange = null;
      input.remove();
      setTimeout(() => {
        captionClipRaw.setTextColor(captionColor);
        this.initStage();
        this.timelineClass.seekTimeline();
      });
    };
    input.onblur = onChange;
    input.onchange = onChange;
    input.oninput = e => {
      const preWidth = parseInt(input.style.width);
      calculateRect(preWidth, e.target.value || "");
    };
    input.onclick = e => {
      e.stopPropagation();
    };
    container.appendChild(input);
    input.focus();
  }
  setEvent() {
    if (this.clip.type === CLIP_TYPES.CAPTION) {
      this.node.on("dblclick", () => {
        this.captionInput(this.clip);
      });
    }
    this.rectTransform.on("mousedown", () => {
      store.commit("setEditBoxStatus", true);
    });
    this.deleteNode.on("click", () => {
      this.deleteClip();
      this.destroy();
    });
    this.deleteNode.on("mouseenter", e => {
      e.evt.target.style.cursor = "pointer";
    });
    this.deleteNode.on("mouseleave", e => {
      e.evt.target.style.cursor = "default";
    });
  }
  async deleteClip() {
    await this.timelineClass.stopEngin();
    let index = -1;
    if (this.clip.type === CLIP_TYPES.CAPTION) {
      this.timelineClass.timeline.removeCaption(this.clip.raw);
      index = store.state.clip.captions.findIndex(
        i => i.uuid === this.clip.uuid
      );
    } else if (this.clip.type === CLIP_TYPES.STICKER) {
      this.timelineClass.timeline.removeAnimatedSticker(this.clip.raw);
      index = store.state.clip.captions.findIndex(
        i => i.uuid === this.clip.uuid
      );
    }
    this.timelineClass.seekTimeline();
    store.commit("clip/deleteClipToVuex", { type: this.clip.type, index });
  }
}
