<template>
  <div class="sticker-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      :infinite-scroll-distance="3"
      infinite-scroll-immediate
      :infinite-scroll-disabled="disabled"
    >
      <li
        v-for="sticker of stickerList"
        :key="sticker.uuid"
        class="list-item"
        v-loading="sticker.isInstalling"
        @click="addSticker(sticker)"
      >
        <img
          :src="sticker.coverUrl"
          draggable="true"
          @dragstart="drag($event, sticker)"
          :alt="sticker.displayName || ''"
        />
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
import dragMixin from "@/mixins/dragMixin";
import { CLIP_TYPES } from "@/utils/Global";
import sticker from "@/mock/sticker";

export default {
  components: {},
  mixins: [dragMixin],

  data() {
    return {
      stickerList: [],
      isLoading: false,
      isNoMore: false,
      page: 0
    };
  },
  computed: {
    disabled() {
      return this.isLoading || this.isNoMore;
    }
  },
  created() {
    this.getStickers();
  },
  methods: {
    addSticker(sticker) {
      this.$bus.$emit(this.$keys.editClip, null, {
        target: sticker,
        type: CLIP_TYPES.STICKER
      });
    },
    drag(e, sticker) {
      const data = JSON.stringify({
        type: CLIP_TYPES.STICKER,
        target: sticker
      });
      e.dataTransfer.setData("Text", data);
    },
    handleMousedown(e, sticker) {
      this.draggingStyle = {
        width: e.target.offsetWidth + "px",
        height: e.target.offsetHeight + "px",
        top: e.clientY + "px",
        left: e.clientX + "px",
        backgroundImage: `url(${sticker.coverUrl})`
      };
      this.isDragging = true;
      this.draggingClip = sticker;
      document.body.addEventListener("mousemove", this.handleMousemove);
      document.body.addEventListener("mouseup", this.handleMouseup, {
        once: true
      });
    },
    handleMousemove(e) {
      e.preventDefault();
      this.draggingStyle = {
        top: e.clientY + "px",
        left: e.clientX + "px"
      };
    },

    handleMouseup(e) {
      this.isDragging = false;
      if (this.inLiveWindowRangeOrNot(e.clientX, e.clientY)) {
        this.$bus.$emit(this.$keys.editClip, e, {
          type: CLIP_TYPES.STICKER,
          target: this.draggingClip
        });
      }
      document.body.removeEventListener("mousemove", this.handleMousemove);
    },
    inLiveWindowRangeOrNot(mouseLeft, mouseTop) {
      const liveWindow = document.getElementById("live-window");
      if (!liveWindow) return false;
      const { left, top, width, height } = liveWindow.getBoundingClientRect();
      if (mouseLeft <= left + width && mouseTop <= top + height) {
        return true;
      }
      return false;
    },
    async load() {
      if (this.isNoMore) return;
      this.isLoading = true;
      try {
        this.page++;
        await this.getStickers();
      } catch (e) {
        this.$message({ type: "warning", message: e });
      }
      this.isLoading = false;
      // this.$emit('onLoad')
    },
    async getStickers() {
      const res = await this.axios.get(this.$api.stickers);
      console.log("贴纸返回", res);
      const { stickers } = res;
      for (let i = 0; i < stickers.length; i++) {
        const sticker = {
          coverUrl: stickers[i].thumbnail_url,
          packageUrl: stickers[i].sticker_url,
          desc: stickers[i].sticker_uuid,
          isInstalling: true
        };
        this.stickerList.push(sticker);
        installAsset(sticker.packageUrl).then(() => {
          sticker.isInstalling = false;
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sticker-list {
  padding: 0 20px;
  overflow-y: auto;
  color: #fff;
  @include scrollBarStyle();

  .list {
    display: grid;
    padding: 0;
    list-style: none;

    img {
      width: 100%;
    }
  }
  p {
    @include textAlignH();
  }
}

@media screen and (max-width: 3000px) {
  .list {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  .template-load-more {
    grid-column-start: span 5;
  }
}
@media screen and (max-width: 1600px) {
  .list {
    grid-template-columns: repeat(5, 1fr);
  }
  .template-load-more {
    grid-column-start: span 4;
  }
}
@media screen and (max-width: 1400px) {
  .list {
    grid-template-columns: repeat(4, 1fr);
  }
  .template-load-more {
    grid-column-start: span 3;
  }
}
@media screen and (max-width: 1200px) {
  .list {
    grid-template-columns: repeat(3, 1fr);
  }
  .template-load-more {
    grid-column-start: span 2;
  }
}
</style>

<i18n>
{
  "en": {
    "loading": "Loading",
    "nomore": "Nomore"
  }
}
</i18n>
