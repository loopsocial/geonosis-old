<template>
  <div class="clip-window">
    <div @click="play">播放</div>
    <div @click="stop">停止</div>
    <canvas ref="clipWindow" id="clip-window"></canvas>
    <div class="thumbs">
      <div class="selected">
        <div class="thumbs"></div>
        <div class="selected-range"></div>
      </div>
    </div>
  </div>
</template>

<script>
import initSDK from "../utils/NvBase";
import TimelineClass from "../utils/TimelineClass";
export default {
  data() {
    return {
      list: [
        {
          m3u8Url:
            "https://alieasset.meishesdk.com/video/17/7f8da20b-ec9b-4c78-a410-17cbccaa4dea.m3u8",
          duration: 25960000
        },
        {
          m3u8Url:
            "https://alieasset.meishesdk.com/image/6/49b95ca4-0fc3-4663-8842-4fddd05ffff3.m3u8",
          duration: 5000000
        },
        {
          m3u8Url:
            "https://alieasset.meishesdk.com/video/6/79b2665f-6f37-44cd-94aa-a8dfd926f1a3.m3u8",
          duration: 1560000
        },
        {
          m3u8Url:
            "https://alieasset.meishesdk.com/video/6/ca011596-597c-415f-b794-ce0bb450dcdd.m3u8",
          duration: 37200000
        },
        {
          m3u8Url:
            "https://alieasset.meishesdk.com/video/2/4a84b0ff-4907-4d37-a5f7-e529acb54487.m3u8",
          duration: 15000000
        }
      ]
    };
  },
  created() {
    initSDK()
      .then(res => {
        console.log("初始化SDK成功", res);
        this.timelineClass = new TimelineClass(res, "clip-window");
      })
      .catch(e => {
        console.error("初始化SDK失败", e);
      });
  },
  methods: {
    setWindowSize() {
      let clipWindow = this.$refs.clipWindow;
      clipWindow.width = clipWindow.offsetWidth;
      clipWindow.height = (clipWindow.offsetWidth / 16) * 9;
    },
    async addClipList(list) {
      let inPoint = 0;
      for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const response = await this.axios.get(item.m3u8Url);
        FS.writeFile(`/m3u8/${i}.m3u8`, response.data);
        this.track.addClip(`/m3u8/${i}.m3u8`, inPoint);
        inPoint += item.duration;
      }
    },
    play() {
      if (this.timelineClass) {
        this.timelineClass.play();
      }
    },
    stop() {
      if (this.timelineClass) {
        this.timelineClass.stop();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
#clip-window {
  width: 50%;
  background-color: #928;
}
</style>
