<template>
  <div class="styles ln-templates">
    <div class="material">
      <el-tabs v-model="active" class="ln-tabs-body ln-template-tabs">
        <el-tab-pane :label="$t('styles')" name="styles">
          <MusicList />
        </el-tab-pane>
        <el-tab-pane name="likes">
          <svg-icon
            slot="label"
            :icon-class="active === 'likes' ? 'heart-red' : 'heart'"
          ></svg-icon>
        </el-tab-pane>
      </el-tabs>
      <div class="none">
        <svg-icon slot="label" icon-class="none"></svg-icon>
        {{ $t("none") }}
      </div>
    </div>
    <Preview />
  </div>
</template>

<script>
import Preview from "../Preview";
import MusicList from "./MusicList";
export default {
  components: { Preview, MusicList },
  data() {
    return {
      active: "styles"
    };
  }
};
</script>

<style lang="scss" scoped>
.ln-templates {
  position: relative;
  display: flex;
  width: 92%;
  .none {
    position: absolute;
    top: 30px;
    right: 0;
    color: white;
  }
  .material {
    display: flex;
    padding: 18px 0 0 26px;

    position: relative;
    flex: 1;
  }
  .preview {
    margin: 20px 9% 20px 7%;
    height: auto;
    ::v-deep .live-window-container {
      border-radius: 6px;
      overflow: hidden;
    }
  }
  ::v-deep {
    .el-tab-pane {
      height: 100%;
    }
    .el-tabs__nav {
      width: 100%;
    }
    .el-tabs__item {
      font-size: 1.3vw;
      color: #fff;
    }
    .el-tabs__content {
      height: calc(100% - 75px);
    }
  }
}
</style>
<i18n>
{
  "en": {
    "styles": "Trending Style",
    "none": "None"
  }
}
</i18n>
