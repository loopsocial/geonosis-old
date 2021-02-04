<template>
  <div class="project flex">
    <div class="pre-project">
      <el-button round class="round-btn default" size="medium">{{
        $t("previous")
      }}</el-button>
      <span class="message">{{ $t("Draft") }}</span>
      <div class="what-is-it"></div>
    </div>
    <div class="content flex">
      <svg-icon icon-class="project" class="project-icon"></svg-icon>
      <span class="message">{{ $t("msg") }}</span>
      <el-button
        round
        class="round-btn lang"
        autofocus
        size="medium"
        @click="$emit('open-media')"
      >
        {{ $t("addMedia") }}
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {},
  components: {}
};
</script>

<style lang="scss" scoped>
.project {
  height: 100%;
  position: relative;
  .project-icon {
    width: 195px;
    height: 176px;
  }
  .content {
    flex-direction: column;
    .lang {
      padding: 10px 52px;
    }
    .wrapper {
      height: 100%;
    }
    .sticker-list {
      border: 1px solid red;
      margin: 20px 0;
    }
  }
  .message {
    letter-spacing: -0.434118px;
    color: white;
    margin: 30px 0;
  }
  .pre-project {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    top: 0;
    padding-top: 57px;
    .message {
      margin: 32px 18px;
    }
    > div {
      width: 121px;
      height: 179px;
      background-color: #c4c4c4;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "msg": "Add & arrange video clips and images to build your video",
    "addMedia": "Add Media",
    "previous": "Previous Project",
    "Draft": "Draft"
  }
}
</i18n>
