const data = [
  // 一个对象表示一个scene
  {
    video: {
      duration: 10000000,
      motionOn: true,
      trimIn: 0, // video
      trimOut: 10000000, // video
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      source: {
        src: "https://www.abc.com/x.mp4",
        width: 960,
        height: 540,
        aspectRatio: "16:9"
      },
      type: "video"
    },
    text: {
      zValue: 1,
      inPoint: 0, // todo 有疑惑的地方
      fontColor: "#ff000000",
      translationX: 0,
      translationY: 0,
      fontSize: 20,
      frameWidth: 0,
      frameHeight: 0,
      textXAlignment: "center",
      value: "这是字幕",
      font: "https://a.ttf",
      img: {
        source: "https://b.png"
      }
    },
    sticker: {
      // 暂未确定
    }
  },
  {
    video: {
      duration: 8000000,
      motionOn: true,
      trimIn: 0, // video
      trimOut: 8000000, // video
      scaleX: 1,
      scaleY: 1,
      translationX: 0,
      translationY: 0,
      source: {
        src: "https://www.abc.com/x2.jpg",
        width: 540,
        height: 960,
        aspectRatio: "9:16"
      },
      type: "image"
    },
    text: {
      zValue: 1,
      inPoint: 0, // todo 有疑惑的地方
      fontColor: "#ff000000",
      translationX: 0,
      translationY: 0,
      fontSize: 21,
      frameWidth: 0,
      frameHeight: 0,
      textXAlignment: "center",
      value: "这是字幕2",
      font: "https://a2.ttf",
      img: {
        source: "https://b2.png"
      }
    },
    sticker: {
      // 暂未确定
    }
  }
];
export default data;
