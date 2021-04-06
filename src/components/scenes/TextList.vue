<template>
  <div class="text-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      :infinite-scroll-distance="3"
      infinite-scroll-immediate
      :infinite-scroll-disabled="disabled"
      ref="list"
    >
      <li
        v-for="caption of captionList"
        :key="caption.uuid"
        class="list-item"
        v-loading="caption.isInstalling"
        @click="addCaption(caption)"
      >
        <img
          :src="caption.thumbnail_url"
          :alt="caption.displayName || ''"
          draggable="true"
          @dragstart="drag($event, caption)"
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

export default {
  components: {},
  mixins: [dragMixin],
  data() {
    return {
      captionList: [],
      page: 0,
      isLoading: false,
      isNoMore: false,
      captionCount: 0,
      ghostDiv: null
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
  beforeDestroy() {
    this.$refs.list.removeEventListener("mousedown", this.handleMousedown);
  },
  methods: {
    addCaption(caption) {
      if (this.isAdding) {
        return null;
      }
      this.isAdding = true;
      this.$bus.$emit(this.$keys.editClip, null, {
        target: caption,
        type: CLIP_TYPES.CAPTION
      });
      setTimeout(() => {
        this.isAdding = false;
      }, 2000);
    },
    drag(e, caption) {
      const data = JSON.stringify({
        type: CLIP_TYPES.CAPTION,
        target: caption
      });
      e.dataTransfer.setData("Text", data);
    },
    // 使用mousedown/move/up事件做拖拽无法区分mousedown/click事件, 改用drag事件
    handleMousedown(e, caption) {
      this.draggingStyle = {
        width: e.target.offsetWidth + "px",
        height: e.target.offsetHeight + "px",
        top: e.clientY + "px",
        left: e.clientX + "px",
        backgroundImage: `url(${caption.coverUrl})`
      };
      this.isDragging = true;
      this.draggingClip = caption;
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
      // this.changeDragVisible(false);
      this.isDragging = false;
      if (this.inLiveWindowRangeOrNot(e.clientX, e.clientY)) {
        console.log("is in live window");
        this.$bus.$emit(this.$keys.editClip, e, {
          type: CLIP_TYPES.CAPTION,
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
      this.isLoading = true;
      try {
        await this.getStickers();
      } catch (e) {
        this.$message({ type: "warning", message: e });
      }
      this.isLoading = false;
      // this.$emit('onLoad')
    },
    async getStickers() {
      this.getMockCaption();
      return;
      const res = await this.axios.get(this.$api.materials, {
        params: {
          type: 3,
          page: this.page,
          pageSize: 20,
          category: 3
        }
      });
      const { materialCount, materialList } = res.data;
      this.captionCount = materialCount;
      for (let i = 0; i < materialList.length; i++) {
        const sticker = {
          ...materialList[i],
          isInstalling: true
        };
        this.captionList.push(sticker);
        installAsset(materialList[i].packageUrl).then(() => {
          sticker.isInstalling = false;
        });
      }
      if (this.captionList.length >= this.captionCount) {
        this.isNoMore = true;
      }
    },
    getMockCaption() {
      const captions = require("../../mock/caption.json");
      for (let i = 0; i < captions.length; i++) {
        const caption = {
          coverUrl: "",
          ...captions[i],
          isInstalling: true
        };
        this.captionList.push(caption);
        installAsset(captions[i].packageUrl).then(() => {
          caption.isInstalling = false;
        });
      }
      this.isNoMore = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.text-list {
  height: 100%;
  padding: 0 20px;
  overflow-y: auto;
  color: #fff;
  @include scrollBarStyle();

  .list {
    display: grid;
    padding: 0;
    list-style: none;
    grid-auto-rows: 1fr;
  }
  .list-item {
    display: flex;
    align-items: center;
  }
  img {
    width: 100%;
    user-select: none;
  }
  p {
    @include textAlignH();
  }
  @media screen and (max-width: 3000px) {
    .list {
      grid-template-columns: repeat(6, 1fr);
      gap: 20px;
    }
  }
  @media screen and (max-width: 1800px) {
    .list {
      grid-template-columns: repeat(5, 1fr);
    }
  }
  @media screen and (max-width: 1500px) {
    .list {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  @media screen and (max-width: 1200px) {
    .list {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media screen and (max-width: 1000px) {
    .list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>
