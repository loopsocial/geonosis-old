<template>
  <div class="draft-list">
    <div class="draft-list-container">
      <div
        :class="[
          'draft-list-item',
          currentVideoUuid === item.uuid ? 'onfocus' : ''
        ]"
        v-for="(item, index) in videos"
        :key="item.uuid"
        @click="selected(item)"
        :style="{
          background: `linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.3) 100%
          ),
          url('${item.coverUrl}') no-repeat center center/auto 100%`
        }"
      >
        <div class="order-number">{{ index + 1 }}</div>
        <div class="duration">{{ format(item.duration) }}</div>
        <transition name="el-fade-in-linear">
          <div
            class="operate-btns"
            v-if="currentVideoUuid === item.uuid"
            @click.stop
          >
            <div class="icon flex">
              <svg-icon
                class="cut-icon"
                icon-class="cut"
                @click="cut(item)"
              ></svg-icon>
            </div>
            <div class="icon flex">
              <svg-icon
                class="delete-icon"
                icon-class="trash"
                @click="del(index)"
              ></svg-icon>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="add-media-btn flex">
      <svg-icon class="add-icon" icon-class="plus"></svg-icon>
      <span class="add-text">{{ $t("addMedia") }}</span>
    </div>

    <!-- <el-dialog class="ln-dialog" :visible.sync="dialogVisible"></el-dialog> -->
  </div>
</template>

<script>
import { us2time } from "../../utils/common";
import { CLIP_TYPES } from "@/utils/Global";
export default {
  components: {
    // DraftListItem
  },
  props: {},
  data() {
    return {
      height: 0
    };
  },
  mounted() {},
  methods: {
    handleResize() {},
    cut(item) {
      this.dialogVisible = true;
      console.log(item);
    },
    del(index) {
      this.deleteClipToVuex({
        type: CLIP_TYPES.VIDEO,
        index
      });
      const i = Math.min(index, this.videos.length);
      this.currentVideoUuid = this.videos[i].uuid;
      this.$bus.$emit(this.$keys.deleteClip, CLIP_TYPES.VIDEO, index);
    },
    selected(item) {
      this.currentVideoUuid = item.uuid;
    },
    format(ms) {
      return us2time(ms * 1000);
    }
  },
  beforeDestroy() {}
};
</script>

<style lang="scss" scoped>
$infoBgc: rgba(0, 0, 0, 0.5);
$white: #fff;
.draft-list {
  min-width: 111px;
  height: 100%;
  position: relative;
  /* Hide scrollbar for Chrome, Safari and Opera */
  .draft-list-container {
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    position: relative;
    height: 100%;
    width: 100%;
    border-radius: 12px;
    overflow-y: auto;
    padding: 16px;
    box-sizing: border-box;
    .draft-list-item {
      position: relative;
      height: 180px;
      width: 180px;
      border: 2px solid transparent;
      border-radius: 6px;
      transition: 0.3s;
      .order-number {
        position: absolute;
        top: 6px;
        left: 4px;
        width: 2em;
        height: 2em;
        line-height: 2em;
        text-align: center;
        background-color: $infoBgc;
        border-radius: 50%;
        color: $white;
        font-size: 14px;
      }
      .duration {
        position: absolute;
        right: 4px;
        top: 6px;
        padding: 4px 8px;
        background-color: $infoBgc;
        border-radius: 6px;
        color: $white;
        font-size: 14px;
      }
      .operate-btns {
        position: absolute;
        bottom: 10px;
        width: 100%;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px;
        box-sizing: border-box;
        .icon {
          border-radius: 50%;
          height: 40px;
          width: 40px;
          transition: all 0.3s;
          cursor: pointer;
          &:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }
        }
      }
      .cut-icon {
        bottom: 10px;
        left: 10px;
        width: 100%;
        height: 100%;
      }
      .delete-icon {
        bottom: 10px;
        right: 10px;
        width: 100%;
        height: 100%;
      }
    }
    .draft-list-item + .draft-list-item {
      margin-top: 12px;
    }
    .onfocus {
      border-color: $white;
    }
  }

  .add-media-btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 12px;
    width: calc(100% - 32px);
    height: 44px;
    border-radius: 6px;
    background-color: #474747;
    line-height: 46px;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 0 30px #000000;
    .add-icon {
      display: inline-block;
      height: 24px;
      width: 24px;
      text-align: center;
      vertical-align: middle;
      margin-right: 8px;
    }
    .add-text {
      margin-right: 6%;
      font-size: 14px;
      color: $white;
      user-select: none;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "addMedia": "Add Media"
  }
}
</i18n>
