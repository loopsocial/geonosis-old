import Konva from "konva";

export default class WorkFlow {
  constructor(options) {
    const { containerId } = options;
    this.containerId = containerId;
    this.clip = options.clip;
    this.stage = null;
    this.layer = null;
    this.node = null;
    this.timelineClass = options.timelineClass || null;
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
  initRect() {
    const { x, y, width, height } = this.getCoordinateFromPoint();
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
        // 将外部传入的函数的执行放在setTimeout中
        const canonicalPointF = this.aTob(new NvsPointF(x, y));
        const canonicalPrevPointF = this.aTob(new NvsPointF(prevX, prevY));
        const canonicalOffsetX = canonicalPointF.x - canonicalPrevPointF.x;
        const canonicalOffsetY = canonicalPointF.y - canonicalPrevPointF.y;
        const offsetPointF = new NvsPointF(canonicalOffsetX, canonicalOffsetY);
        this.clip.raw.translateCaption(offsetPointF);
        const targetPointF = this.clip.raw.getCaptionTranslation();
        this.clip.translationX = targetPointF.x;
        this.clip.translationY = targetPointF.y;
        this.timelineClass.seekTimeline();
        return pos;
      }
    });
    this.layer.add(this.node);
    const rectTransform = new Konva.Transformer({
      nodes: [this.node],
      rotateEnabled: true,
      borderStrokeWidth: 1,
      borderStroke: "white",
      anchorFill: "white",
      anchorSize: 8,
      anchorStroke: "white",
      anchorCornerRadius: 4,
      rotationSnaps: [0, 90, 180, 270],
      centeredScaling: true,
      keepRatio: true,
      rotateAnchorOffset: 20,
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      boundBoxFunc: (oldBox, newBox) => {
        console.log(oldBox, newBox, "old - new");
        return newBox;
      }
    });
    this.layer.add(rectTransform);
    this.layer.draw();
  }
  getCoordinateFromPoint() {
    const rotation = parseInt(this.clip.raw.getRotationZ());
    const vertices = this.clip.raw.getCaptionBoundingVertices(2); // 2 表示字幕的实际边框, 0 表示字幕中的文字边框
    const { i1, i2, i3, i4 } = this.getVerticesPoint(vertices);
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
  getVerticesPoint(vertices) {
    // - 逆时针
    // - ptr.get(0) 左上
    // - ptr.get(1) 左下
    // - ptr.get(2) 右下
    // - ptr.get(3) 右上
    const i1 = this.bToa(vertices.get(0));
    const i2 = this.bToa(vertices.get(1));
    const i3 = this.bToa(vertices.get(2));
    const i4 = this.bToa(vertices.get(3));

    return { i1, i2, i3, i4 };
  }
  bToa(coordinate) {
    // 渲染层 to 视口层
    const liveWindow = this.timelineClass.liveWindow;
    if (!liveWindow) {
      return;
    }
    return liveWindow.mapCanonicalToView(coordinate);
  }
  aTob(coordinate) {
    // 视口层 to 渲染层
    const liveWindow = this.timelineClass.liveWindow;
    if (!liveWindow) return;
    return liveWindow.mapViewToCanonical(coordinate);
  }
}
