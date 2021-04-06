<template>
  <div
    class="music-list infinite-list-wrapper"
    v-loading.fullscreen.lock="isLoading"
  >
    <ul
      class="list"
      v-infinite-scroll="load"
      infinite-scroll-immediate
      :infinite-scroll-distance="5"
      :infinite-scroll-disabled="disabled"
      ref="list"
    >
      <li class="list-item" v-for="(music, idx) of musicList" :key="music.uuid">
        <div class="music-info">
          <div class="cover">
            <img
              :src="music.thumbnail_url"
              alt=""
              srcset=""
              v-if="music.thumbnail_url"
            />
          </div>
          <div class="info">
            <div class="name">{{ music.name }}</div>
            <div class="artist">{{ music.artist }}</div>
          </div>
          <div class="btns">
            <el-button
              v-if="activeIndex === idx"
              @click="handleCancel($event, idx)"
              type="text"
              >{{ $t(`${"cancel"}`) }}</el-button
            >
            <el-button v-else @click="handleTrim($event, idx)" type="text">{{
              $t(`${"trim"}`)
            }}</el-button>
            <el-button
              type="text"
              class="using-btn"
              @click="applyAudio(music)"
              :title="idx !== activeIndex ? 'Trim First' : 'Use Audio'"
              >{{
                "" + usingMusicId === "" + music.id ? "Using" : "Use"
              }}</el-button
            >
          </div>
        </div>
        <div
          :class="{ 'timeline-wrapper': true, hidden: activeIndex!== idx }"
          ref="timelineWrapper"
        >
          <div class="timeline-cover"></div>
          <div class="slider-wrapper" ref="slider">
            <div
              class="slider-timeline"
              :style="{
                left: timelineLeft * 100 + '%',
                width: videoTimelineWidth * 100 + '%'
              }"
              ref="timeline"
              @mousedown="handleSliderMouseDown"
            ></div>
          </div>
        </div>
      </li>
    </ul>
    <p v-show="isLoading">{{ $t("loading") }}</p>
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
import { AudioClip } from "@/utils/ProjectData";
import { CLIP_TYPES } from "@/utils/Global";
export default {
  data() {
    return {
      musicList: [],
      isLoading: false,
      isNoMore: false,
      musicCount: 0,
      page: 0,
      timelineWidth: 0,
      timelineLeft: 0,
      mousePos: 0, // 鼠标相对于滑块最左边的位置
      activeIndex: -1,
      trimTimeline: null,
      fixedSliderLeft: 0, // 中间彩色固定滑块距左侧父div距离（百分比显示）
      videoTimelineWidth: 0,
      nextPage: "",
      usingMusicId: ""
    };
  },
  watch: {
    audios: {
      handler(newVal) {
        if (newVal.length) {
          this.$emit("useMusic", {
            isShow: true,
            name: newVal[0].name,
            artist: newVal[0].artist
          });
          this.usingMusicId = newVal[0].id;
        } else {
          this.$emit("useMusic", {
            isShow: false,
            name: "",
            artist: ""
          });
          this.usingMusicId = "";
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    disabled() {
      return this.isLoading || this.isNoMore;
    },
    activeAudioClip() {
      if (this.activeIndex === -1) return null;
      return this.musicList[this.activeIndex];
    }
  },
  async created() {
    await this.getMusic();
    this.getUsingMusicId();
  },
  methods: {
    async applyAudio(audioClip) {
      this.activeIndex = -1;
      const loading = this.$loading({
        lock: true,
        text: this.$t("loading"),
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      try {
        this.$emit("clearAudio");
        this.$bus.$emit(this.$keys.clearAudioTrack);
        this.calcAudioTime(audioClip);
        audioClip.m3u8Path = await installAsset(audioClip.file_url);
        this.$bus.$emit(this.$keys.addAudioClip, audioClip);
      } catch (error) {
        console.error("应用音频失败", error);
        this.$message({ type: "error", message: this.$t("applyAudioFailed") });
      } finally {
        loading.close();
      }
    },
    handleCancel() {
      this.activeIndex = -1;
      removeEventListener("resize", this.handleTimelineResize);
    },
    calcAudioTime(audioClip) {
      const fixedSlider = this.$refs.slider[this.activeIndex];
      const timelineWrapper = this.$refs.timelineWrapper[this.activeIndex];

      if (this.timelineLeft > this.fixedSliderLeft) {
        // 只需计算 audio裁剪开始时间trimIn
        const audioTrimInPos =
          (this.timelineLeft - this.fixedSliderLeft) *
          timelineWrapper.offsetWidth;

        audioClip.trimIn =
          (audioTrimInPos / fixedSlider.offsetWidth) * audioClip.orgDuration;
        audioClip.inPoint = 0;
      } else {
        // 只需计算 audio在video入场时间inPoint
        const audioInPointPercentage = this.fixedSliderLeft - this.timelineLeft;

        audioClip.inPoint =
          (audioInPointPercentage / this.videoTimelineWidth) *
          this.getVideoDuration();
      }
    },
    handleTrim(e, idx) {
      this.activeIndex = idx;
      this.calcSliderStyle();
      addEventListener("resize", this.handleTimelineResize);
    },
    getVideoDuration() {
      let time = 0;
      this.videos.forEach(video => {
        video.splitList.forEach(item => {
          time += item.captureOut - item.captureIn;
        });
      });
      return time;
    },
    calcSliderStyle() {
      const videoDuration = this.getVideoDuration();
      const timelineWrapper = this.$refs.timelineWrapper[this.activeIndex];
      const fixedSlider = this.$refs.slider[this.activeIndex];
      const { duration: audioDuration } = this.activeAudioClip;

      this.videoTimelineWidth =
        ((videoDuration / audioDuration) * fixedSlider.offsetWidth) /
        timelineWrapper.offsetWidth; // 计算灰色时间线长度
      this.fixedSliderLeft =
        fixedSlider.offsetLeft / timelineWrapper.offsetWidth;

      this.timelineLeft = fixedSlider.offsetLeft / timelineWrapper.offsetWidth;
    },
    handleSliderMouseDown(e) {
      const timelineWrapper = this.$refs.timelineWrapper[this.activeIndex];

      this.mousePos =
        e.clientX -
        this.timelineLeft * timelineWrapper.offsetWidth -
        timelineWrapper.getBoundingClientRect().left;

      addEventListener("mousemove", this.handleSliderMouseMove);
      addEventListener("mouseup", this.handleSliderMouseUp, { once: true });
    },

    handleSliderMouseUp() {
      removeEventListener("mousemove", this.handleSliderMouseMove);
    },

    handleSliderMouseMove(e) {
      const timeline = this.$refs.timeline[this.activeIndex];
      const timelineWrapper = this.$refs.timelineWrapper[this.activeIndex];
      const fixedSlider = this.$refs.slider[this.activeIndex];

      e.preventDefault();
      this.timelineLeft =
        (e.clientX -
          this.mousePos -
          timelineWrapper.getBoundingClientRect().left) /
        timelineWrapper.offsetWidth;

      if (
        this.timelineLeft * timelineWrapper.offsetWidth >
        fixedSlider.offsetLeft + fixedSlider.offsetWidth
      ) {
        this.timelineLeft =
          (fixedSlider.offsetLeft + fixedSlider.offsetWidth) /
          timelineWrapper.offsetWidth;
      }

      if (
        this.timelineLeft * timelineWrapper.offsetWidth + timeline.offsetWidth <
        fixedSlider.offsetLeft
      ) {
        this.timelineLeft =
          (fixedSlider.offsetLeft - timeline.offsetWidth) /
          timelineWrapper.offsetWidth;
      }
    },

    async load() {
      await this.getMusic({}, true);
    },

    async getMusic(params = {}, isLoadNew) {
      if (!isLoadNew) {
        this.musicList = [];
      }
      const isNoMore = this.isNoMore;
      this.isNoMore = false;
      this.isLoading = true;
      const url = isLoadNew ? "/fw" + this.nextPage : this.$api.soundTracks;
      try {
        const res = await this.axios.get(url, {
          params
        });
        const { paging, soundtracks: materialList } = res;
        this.nextPage = paging.next;
        for (let i = 0; i < materialList.length; i++) {
          const music = {
            ...materialList[i],
            type: CLIP_TYPES.AUDIO,
            trimIn: 0,
            trimOut: materialList[i].duration * 1000 * 1000,
            orgDuration: materialList[i].duration * 1000 * 1000,
            duration: materialList[i].duration * 1000 * 1000
          };
          this.musicList.push(music);
        }
        this.isNoMore = isNoMore;
        if (Object.keys(paging).length === 0) {
          this.isNoMore = true;
        }
      } catch (e) {
        console.warn(e);
        this.$message({ type: "warning", message: e.message });
      } finally {
        this.isLoading = false;
      }
    },
    getUsingMusicId() {
      this.usingMusicId = (this.audios.length && this.audios[0].id) || "";
    }
  },
  beforeDestroy() {
    removeEventListener("resize", this.handleTimelineResize);
    removeEventListener("mousedown", this.handleSliderMouseDown);
  }
};
</script>

<style lang="scss" scoped>
.music-list {
  height: calc(100% - 55px);
  overflow: auto;
  padding: 0 20px;
  color: $white;
  @include scrollBarStyle();
  .list {
    .list-item {
      .music-info {
        display: flex;
        margin-bottom: 20px;
        height: 63px;
        position: relative;
        border-radius: 6px;
      }
      .timeline-wrapper {
        .timeline-cover {
          position: absolute;
          z-index: 999;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.5) 0,
            rgba(0, 0, 0, 0.5) 39.8%,
            transparent 39.5%,
            transparent 60.2%,
            rgba(0, 0, 0, 0.5) 60.2%,
            rgba(0, 0, 0, 0.5) 100%
          );
          pointer-events: none;
        }
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        flex-direction: column;
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        transition: all 0.2s;
        overflow: hidden;
        margin-bottom: 20px;
        &.hidden {
          height: 0;
        }

        .slider-wrapper {
          width: 20%;
          height: 40px;
          border: 2px solid $white;
          background: linear-gradient(
            219.63deg,
            #f78361 16.24%,
            #f54b64 86.68%
          );
          border-radius: 6px;
          box-sizing: content-box;
          z-index: 0;
          .slider-timeline {
            position: absolute;
            height: 100%;
            background: url("../../assets/images/timeline-white.png") 0
              center/auto 24px repeat-x;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 6px;
            transform: translateY(-1px);
          }
        }
      }
      .cover {
        height: 63px;
        width: 63px;
        background-color: white;
        border-radius: 6px;
        img {
          height: 100%;
          width: 100%;
        }
      }
      .info {
        margin-left: 7px;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;
        font-weight: 600;
        .name {
          font-size: 16px;
        }
        .artist {
          font-size: 14px;
          color: $msg-font-color;
        }
      }
      .btns .el-button {
        color: $white;
        border-radius: 20px;
        padding: 8px 16px;
        z-index: 10;
        transition: all 0.3s;
        cursor: pointer;
        &.is-disabled {
          color: rgba($color: $white, $alpha: 0.5);
          cursor: default;
        }
        &:not(.is-disabled) {
          &:hover {
            background-color: rgba($color: $white, $alpha: 0.1);
          }
        }
      }
      .using-btn {
        font-size: 16px;
      }
    }
  }
  p {
    @include textAlignH();
  }
}
</style>

<i18n>
{
  "en": {
    "trim":"Trim",
    "use":"Use",
    "cancel":"Cancel",
    "loading":"Loading...",
    "applyAudioFailed": "Apply Audio Failed"
  }
}
</i18n>
