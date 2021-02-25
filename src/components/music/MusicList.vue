<template>
  <div class="music-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      infinite-scroll-immediate
      :infinite-scroll-distance="5"
      :infinite-scroll-disabled="disabled"
      ref="list"
    >
      <li
        class="list-item"
        v-for="(music, idx) of musicList"
        :key="music.uuid"
        v-loading="!music.m3u8Path"
      >
        <div class="music-info">
          <div class="cover">
            <img :src="music.coverUrl" alt="" srcset="" v-if="music.coverUrl" />
          </div>
          <div class="info">
            <div class="name">{{ music.name }}</div>
            <div class="singer">Icarus</div>
          </div>
          <div class="btns">
            <el-button @click="handleTrim($event, idx)" type="text">{{
              $t(`${music.timelineVisible ? "cancel" : "trim"}`)
            }}</el-button>
            <el-button type="text" @click="applyAudio(music)">{{
              $t("use")
            }}</el-button>
          </div>
        </div>

        <div class="timeline-wrapper" v-if="music.timelineVisible">
          <div
            class="slider-wrapper"
            :style="{
              left: sliderLeft + 'px',
              width: sliderWidth + 'px'
            }"
            @mousedown="handleSliderMouseDown"
            ref="slider"
          >
            <div
              class="slider"
              :style="{ backgroundPosition: sliderBgPos + 'px' }"
            >
              <div class="arrow left" @mousedown="handleLeftMouseDown"></div>
              <div class="arrow right" @mousedown="handleRightMouseDown"></div>
            </div>
          </div>

          <div class="timeline" ref="timeline"></div>
        </div>
        <!-- <img :src="style.coverUrl" alt="" /> -->
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
    <p v-else-if="isNoMore">{{ $t("noMore") }}</p>
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
export default {
  data() {
    return {
      musicList: [],
      isLoading: false,
      isNoMore: false,
      musicCount: 0,
      page: 0,
      timelineVisible: false,
      timelineWidth: 0,
      sliderLeft: 0,
      sliderWidth: 120,
      mousePos: 0, // 鼠标相对于滑块最左边的位置
      sliderBgPos: 0,
      activeIndex: 0,
      sliderPos: {
        // 滑块位置，占比表示
        start: 0,
        end: 0
      },
      trimTimeline: null,
      timelineHeight: 0,
      sliderEndPercentage: 0
    };
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
  created() {
    this.getMusic();
  },
  mounted() {},
  methods: {
    applyAudio(audioClip) {
      this.$bus.$emit(this.$keys.addAudioClip, audioClip);
    },
    handleTrim(e, idx) {
      this.musicList[idx].timelineVisible ||
        this.musicList.forEach((item, index) => {
          this.$set(this.musicList[index], "timelineVisible", false);
        });
      this.musicList[idx].timelineVisible = !this.musicList[idx]
        .timelineVisible;

      this.$nextTick(() => {
        if (this.musicList[idx].timelineVisible) {
          this.activeIndex = idx;
          this.calcSliderPosAndWidth();
          this.markSliderInitPos();
          addEventListener("resize", this.handleTimelineResize);
        } else {
          this.activeIndex = -1;
          removeEventListener("resize", this.handleTimelineResize);
        }
      });
    },

    calcSliderPosAndWidth() {
      this.sliderLeft =
        (this.activeAudioClip.trimIn / this.activeAudioClip.duration) *
        this.$refs.timeline[0].offsetWidth;
      this.sliderWidth =
        (this.activeAudioClip.trimOut / this.activeAudioClip.orgDuration) *
        this.$refs.timeline[0].offsetWidth;
    },

    markSliderInitPos() {
      this.sliderPos.start =
        this.sliderLeft / this.$refs.timeline[0].offsetWidth;
      this.sliderPos.end =
        (this.sliderLeft + this.sliderWidth) /
        this.$refs.timeline[0].offsetWidth;
    },

    handleTimelineResize() {
      this.sliderLeft =
        this.sliderPos.start * this.$refs.timeline[0].offsetWidth;
      this.sliderWidth =
        this.sliderPos.end * this.$refs.timeline[0].offsetWidth -
        this.sliderLeft;
    },

    handleLeftMouseDown(e) {
      this.mousePos =
        e.clientX -
        (this.$refs.timeline[0].getBoundingClientRect().left + this.sliderLeft);
      this.sliderEndPercentage =
        (this.sliderWidth + this.sliderLeft) /
        this.$refs.timeline[0].offsetWidth;

      addEventListener("mousemove", this.handleLeftMouseMove);
      addEventListener("mouseup", this.handleLeftMouseUp, { once: true });
    },
    handleLeftMouseMove(e) {
      e.preventDefault();
      const [timeline] = this.$refs.timeline;
      const minDuration = 5000 * 1000;
      const minWidth =
        (timeline.offsetWidth / this.activeAudioClip.orgDuration) * minDuration;

      this.sliderLeft =
        e.clientX - this.mousePos - timeline.getBoundingClientRect().left;
      this.sliderWidth =
        this.sliderEndPercentage * timeline.offsetWidth - this.sliderLeft;

      if (this.sliderLeft < 0) {
        this.sliderLeft = 0;
        this.sliderWidth = this.sliderEndPercentage * timeline.offsetWidth;
      }
      if (this.sliderWidth < minWidth) {
        this.sliderLeft =
          this.sliderEndPercentage * timeline.offsetWidth - minWidth;
        this.sliderWidth = minWidth;
      }
    },
    handleLeftMouseUp() {
      removeEventListener("mousemove", this.handleLeftMouseMove);
    },
    handleRightMouseDown(e) {
      e.stopPropagation();

      this.mousePos =
        this.$refs.slider[0].getBoundingClientRect().left +
        this.sliderWidth -
        e.clientX;

      addEventListener("mousemove", this.handleRightMouseMove);
      addEventListener("mouseup", this.handleRightMouseUp, { once: true });
    },
    handleRightMouseMove(e) {
      e.preventDefault();
      this.sliderWidth =
        e.clientX -
        this.$refs.timeline[0].getBoundingClientRect().left -
        this.sliderLeft +
        this.mousePos;
      if (this.sliderWidth > this.$refs.timeline[0].offsetWidth) {
        this.sliderWidth = this.$refs.timeline[0].offsetWidth;
      }

    },
    handleRightMouseUp() {
      removeEventListener("mousemove", this.handleRightMouseMove);
    },
    handleSliderMouseDown(e) {
      this.mousePos =
        e.clientX -
        this.sliderLeft -
        this.$refs.timeline[0].getBoundingClientRect().left;
      addEventListener("mousemove", this.handleSliderMouseMove);
      addEventListener("mouseup", this.handleSliderMouseUp, { once: true });
    },

    handleSliderMouseUp() {
      removeEventListener("mousemove", this.handleSliderMouseMove);
    },

    handleSliderMouseMove(e) {
      e.preventDefault();
      this.sliderLeft =
        e.clientX -
        this.mousePos -
        this.$refs.timeline[0].getBoundingClientRect().left;
      this.sliderBgPos = -this.sliderLeft;

      if (this.sliderLeft < 0) {
        this.sliderLeft = 0;
        this.sliderBgPos = 0;
      }

      if (
        this.sliderLeft + this.sliderWidth >
        this.$refs.timeline[0].offsetWidth
      ) {
        this.sliderLeft = this.$refs.timeline[0].offsetWidth - this.sliderWidth;
        this.sliderBgPos = -this.sliderLeft;
      }
    },

    async load() {
      this.isLoading = true;
      await this.getMusic();
      this.isLoading = false;
    },

    async getMusic() {
      const res = await this.axios.get(this.$api.materials, {
        params: {
          type: 7,
          page: this.page,
          pageSize: 40,
          category: 1
        }
      });
      const { materialCount, materialList } = res.data;
      this.musicCount = materialCount;
      for (let i = 0; i < materialList.length; i++) {
        const music = {
          ...materialList[i],
          name: materialList[i].displayName,
          trimIn: 0,
          trimOut: materialList[i].duration * 1000,
          orgDuration: materialList[i].duration * 1000
        };
        this.musicList.push(music);
        installAsset(materialList[i].m3u8Url).then(r => {
          this.$set(music, "m3u8Path", r);
        });
      }
      if (this.musicList.length >= this.musicCount) {
        this.isNoMore = true;
      }
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
  height: 100%;
  overflow: auto;
  padding: 0 20px;
  color: #fff;
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
        position: relative;
        flex-direction: column;
        width: 100%;
        height: 40px;
        box-sizing: border-box;
        transition: all 1s ease;
        overflow: hidden;
        .timeline {
          width: 100%;
          height: 100%;
          z-index: 999;
          background: url("../../assets/images/timeline.png") 0 center/auto 24px
            repeat-x;
        }
        .slider {
          position: absolute;
          z-index: 999;
          height: 36px;
          width: 100%;

          background: url("../../assets/images/timeline-white.png") center/auto
            24px repeat-x;
          .arrow {
            position: absolute;
            width: 20px;
            height: 100%;
          }
          .left {
            left: 0;
          }
          .right {
            right: 0;
          }
        }

        .slider-wrapper {
          z-index: 666;
          position: absolute;
          width: 154px;
          height: 40px;
          border: 2px solid #fff;
          background: linear-gradient(
            219.63deg,
            #f78361 16.24%,
            #f54b64 86.68%
          );
          border-radius: 6px;
          box-sizing: border-box;
        }
      }
      .cover {
        height: 63px;
        width: 63px;
        background-color: pink;
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
        .singer {
          font-size: 14px;
          color: #9b9b98;
        }
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
    "noMore": "No More",
    "cancel":"Cancel"
  }
}
</i18n>
