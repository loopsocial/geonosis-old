<template>
  <div class="materials">
    <el-tabs v-model="activeName" class="ln-tabs-body">
      <el-tab-pane label="text" name="text" lazy>
        <template #label>
          <svg-icon class="text-icon" icon-class="text"></svg-icon>
          {{ $t("text") }}
        </template>
        <TextList />
        <FontPanel />
      </el-tab-pane>
      <el-tab-pane label="sticker" name="sticker" lazy>
        <template #label>
          <svg-icon class="sticker-icon" icon-class="sticker"></svg-icon>
          {{ $t("sticker") }}
        </template>
        <StickerList />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import StickerList from "./StickerList";
import TextList from "./TextList";
import FontPanel from "./FontPanel";
export default {
  components: {
    StickerList,
    TextList,
    FontPanel
  },
  data() {
    return {
      activeName: "text"
    };
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.materials {
  .el-tabs {
    height: 100%;
  }
  ::v-deep {
    .el-tabs__nav {
      width: 100%;
    }
    .el-tabs__item {
      font-size: 1.3vw;
      color: #fff;
    }
    .el-tabs__content {
      height: calc(100% - 50px);
    }
    .el-tabs__active-bar {
      background-color: #fff;
    }
    .el-tab-pane {
      height: 100%;
    }
  }
  .sticker-list {
    height: calc(100% - 40px);
  }
}
</style>

<i18n>
{
  "en": {
    "text":"Text",
    "sticker":"Sticker",
    "msg": "Add & arrange video clips and images to build your video",
    "addMedia": "Add Media",
    "previous": "Previous Project",
    "Draft": "Draft"
  }
}
</i18n>
