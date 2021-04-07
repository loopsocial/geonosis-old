import Konva from "konva";
import { CLIP_TYPES } from "@/utils/Global";
import { toPercentage, vectorRotate } from "@/utils/common";
import delImg from "../assets/images/delete.png";
import store from "../store/index";
import Keys from "../utils/EventBusKeys";
import Bus from "../EventBus";

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
    this.box = {};
    this.timelineClass = options.timelineClass || null;
    this.initStage();
    this.dom = document.getElementById(containerId);
  }
  initStage(clip) {
    if (this.stage && this.stage instanceof Konva.Stage) {
      this.stage.destroy();
    }
    if (!this.containerId) {
      console.warn("缺少容器");
      return;
    }
    this.clip = clip || this.clip;
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
        const canonicalPointF = WorkFlow.aTob(
          new NvsPointF(x, y),
          this.timelineClass.liveWindow
        );
        const canonicalPrevPointF = WorkFlow.aTob(
          new NvsPointF(prevX, prevY),
          this.timelineClass.liveWindow
        );
        const canonicalOffsetX = canonicalPointF.x - canonicalPrevPointF.x;
        const canonicalOffsetY = canonicalPointF.y - canonicalPrevPointF.y;
        const offsetPointF = new NvsPointF(canonicalOffsetX, canonicalOffsetY);
        if (this.clip.type === CLIP_TYPES.CAPTION) {
          this.captionDrag(offsetPointF);
        } else if (this.clip.type === CLIP_TYPES.STICKER) {
          this.stickerDrag(offsetPointF);
        }
        this.timelineClass.seekTimeline();
        const p = this.targetPos({ ...this.box, ...pos });
        this.deleteNode.x(p.x);
        this.deleteNode.y(p.y);

        return pos;
      }
    });
    const image = await this.getImage();
    this.deleteNode = new Konva.Image({
      x: x + width / 2,
      y: y + height,
      image,
      width: 46,
      height: 46,
      offset: {
        x: 23,
        y: 0
      }
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
    this.box = {
      width,
      height,
      rotation: this.clip.rotation / 180
    };
    this.layer.add(this.deleteNode);
    this.layer.add(this.node);
    window.node = this.deleteNode;
    this.rectTransform = new Konva.Transformer({
      nodes: [this.node],
      rotateEnabled: false,
      borderStrokeWidth: 1,
      borderStroke: "white",
      anchorFill: "white",
      anchorSize: 8,
      anchorStroke: "white",
      anchorCornerRadius: 4,
      // rotationSnaps: [0, 45, 90, 135, 180, 225, 270],
      centeredScaling: this.clip.type === CLIP_TYPES.STICKER,
      keepRatio: this.clip.type === CLIP_TYPES.STICKER,
      // rotateAnchorOffset: 20,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      boundBoxFunc: (oldBox, newBox) => {
        const box = this.node.getClientRect();
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        const rectCenter = { x, y };
        if (this.clip.type === CLIP_TYPES.CAPTION) {
          this.captionTransformer(oldBox, newBox, rectCenter);
        } else if (this.clip.type === CLIP_TYPES.STICKER) {
          this.stickerTransformer(oldBox, newBox, rectCenter);
        }
        this.timelineClass.seekTimeline();
        // 缩放、旋转时设置删除按钮位置
        const tarPos = this.targetPos(newBox);
        this.deleteNode.x(tarPos.x);
        this.deleteNode.y(tarPos.y);
        this.deleteNode.rotation((newBox.rotation / Math.PI) * 180);
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
  static getCoordinateFromPoint(clip, liveWindow, type = 3) {
    const rotation = parseInt(clip.raw.getRotationZ());
    let vertices;
    if (clip.type === CLIP_TYPES.CAPTION) {
      // if (isRectangle) {
      //   vertices = clip.raw.getBoundingRectangleVertices();
      // }
      // if (!vertices) {
      vertices = clip.raw.getCaptionBoundingVertices(type);
      // }
    } else if (clip.type === CLIP_TYPES.STICKER) {
      vertices = clip.raw.getBoundingRectangleVertices();
    }
    if (!vertices) {
      console.warn("获取素材边框失败");
      return {};
    }
    let i1, i2, i3, i4;
    if (
      type === NvsCaptionTextBoundingTypeEnum.Frame ||
      clip.type === CLIP_TYPES.STICKER
    ) {
      const v = WorkFlow.getVerticesPoint(vertices, liveWindow);
      i1 = v.i1;
      i2 = v.i2;
      i3 = v.i3;
      i4 = v.i4;
    } else {
      const { translationX, translationY } = clip;
      const f = i => ({ x: i.x + translationX, y: i.y + translationY }); // 框的位置基本不变，需要加上transition
      i1 = f(vertices.get(0));
      i2 = f(vertices.get(1));
      i3 = f(vertices.get(2));
      i4 = f(vertices.get(3));
      // - 逆时针 i1, i2, i3, i4
      i1 = WorkFlow.bToa(new NvsPointF(i1.x, i1.y), liveWindow);
      i2 = WorkFlow.bToa(new NvsPointF(i2.x, i2.y), liveWindow);
      i3 = WorkFlow.bToa(new NvsPointF(i3.x, i3.y), liveWindow);
      i4 = WorkFlow.bToa(new NvsPointF(i4.x, i4.y), liveWindow);
    }

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
  //  liveWindow -> canvas
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
  // canvas -> liveWindow
  static aTob(coordinate, liveWindow) {
    // 视口层 to 渲染层
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
    // 容器宽高
    const {
      width: viewWidth,
      height: viewHeight
    } = this.dom.getBoundingClientRect();
    const { x, y, width, height } = newBox;
    const liveWindow = this.timelineClass.liveWindow;
    // 计算rect在liveWindow坐标系下的left、top
    let { x: left, y: top } = WorkFlow.aTob(new NvsPointF(x, y), liveWindow);
    left -= this.clip.translationX;
    top -= this.clip.translationY;
    // 计算rect再liveWindow坐标系下的宽高
    let { x: liveWidth, y: liveHeight } = WorkFlow.aTob(
      new NvsPointF(width + viewWidth / 2, height + viewHeight / 2),
      liveWindow
    );
    liveWidth = Math.abs(liveWidth);
    liveHeight = Math.abs(liveHeight);
    const right = left + liveWidth;
    const bottom = top - liveHeight;
    const rect = new NvsRectF(left, top, right, bottom);
    //     console.log(`isFrameCaption ${this.clip.raw.isFrameCaption()}
    //     ┌────── Top:${rect.top.toString().substring(0, 4)} ──────┐
    // Left:${rect.left.toFixed(2)}            Right:${rect.right.toFixed(2)}
    //     └──── Bottom:${rect.bottom.toString().substring(0, 4)} ─────┘
    //     `);
    this.clip.raw.setTextFrameOriginRect(rect);
    // 记录frameWidth、Height
    const { videoWidth, videoHeight } = store.state.clip;
    const rectWidth = right - left;
    const rectHeight = top - bottom;
    this.clip.frameWidth = toPercentage(rectWidth / videoWidth);
    this.clip.frameHeight = toPercentage(rectHeight / videoHeight);
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
    this.clip.raw.scaleAnimatedSticker(
      scaleFactorX,
      WorkFlow.aTob(centerPointF, this.timelineClass.liveWindow)
    );
    this.clip.scale = this.clip.raw.getScale();
    // 旋转操作
    const diffRotation = oldBox.rotation - newBox.rotation;
    if (diffRotation) {
      this.clip.raw.rotateAnimatedSticker(
        (diffRotation / Math.PI) * 180,
        WorkFlow.aTob(centerPointF, this.timelineClass.liveWindow)
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
    let input = document.createElement("textarea");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const container = document.getElementById(this.containerId);

    const { x, y, width, height } = WorkFlow.getCoordinateFromPoint(
      this.clip,
      this.timelineClass.liveWindow
      // NvsCaptionTextBoundingTypeEnum.Frame
    );
    let textArr = text.split("\n");
    const fontSizeTemp = {
      1: 1,
      2: 0.8,
      3: 0.6,
      4: 0.5,
      5: 0.4
    };
    const t = Math.max(textArr.length, Math.ceil(text.length / 50));
    const fontRatio = fontSizeTemp[t];
    input.style.textAlign = this.clip.align || "center";
    input.style.boxSizing = "content-box";
    input.style.position = "absolute";
    input.style.width = width + "px";
    input.style.height = height + "px";
    input.style.lineHeight = 1;
    input.style.verticalAlign = "middle";
    input.style.fontSize =
      captionClipRaw.getFontSize() * window.ABTimes * fontRatio + "px";
    input.style.fontFamily = captionClipRaw.getFontFamily() || "sans-serif";
    input.style.fontWeight = captionClipRaw.getBold() ? "600" : "300";
    input.style.left = x + "px";
    input.style.top = y + "px";
    input.style.zIndex = 200;
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
      this.node.width(this.rectTransform.width());
      input.style.width = this.rectTransform.width() + "px";
    };

    calculateRect(width, text);
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
        store.commit("clip/updateClipToVuex", this.clip);
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
      Bus.$emit(Keys.delCaptionSticker, this.clip);
    });
    this.deleteNode.on("mouseenter", e => {
      e.evt.target.style.cursor = "pointer";
    });
    this.deleteNode.on("mouseleave", e => {
      e.evt.target.style.cursor = "default";
    });
  }
  targetPos(box) {
    this.box = box;
    const { x, y, width, height, rotation } = box;
    this.rotation = rotation;
    const sin = Math.sin(rotation);
    const cos = Math.cos(rotation);
    // 上边线的中点
    const center = {
      x: (width / 2) * cos + x,
      y: y + (width / 2) * sin
    };
    return {
      x: center.x - height * sin,
      y: center.y + height * cos
    };
  }
}

// store.commit("clip/updateClipToVuex", this.clip);
