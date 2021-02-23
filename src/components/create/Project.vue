<template>
  <div class="project flex">
    <div class="content flex" ref="content">
      <h2 class="title">{{ $t("start") }}</h2>
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
  methods: {}
};
</script>

<style lang="scss" scoped>
.project {
  height: 100%;
  position: relative;
  justify-content: space-around;
  align-items: center;
  .title {
    color: #fff;
    font-weight: 600;
    font-size: 16px;
  }
  .project-icon {
    width: 195px;
    height: 176px;
  }
  .content {
    height: 74.2vh;
    width: calc(74.2vh * 0.5625);
    border: 1px dashed #9b9b9b;
    border-radius: 6px;

    flex-direction: column;
    .title {
      position: absolute;
      top: 1.5%;
    }
    .lang {
      padding: 10px 52px;
    }
    .wrapper {
      height: 100%;
    }
  }
  .message {
    padding: 0 40px;
    text-align: center;
    letter-spacing: -0.434118px;
    color: white;
    margin: 30px 0;
  }
  .pre-project {
    height: 100%;
    width: 50%;
    display: flex;
    flex-direction: column;

    .message {
      margin: 32px 18px;
    }
    .what-is-it {
      margin-right: 16px;
      margin-bottom: 10px;
      flex-shrink: 0;
      color: #fff;
      .cover {
        background-color: pink;
        border-radius: 6px;
        padding-top: 161.4%;
      }
      span {
        display: inline-block;
        margin-top: 10px;
      }
    }
    .item-container {
      display: grid;
      height: calc(100% - 90px);
      overflow: auto;
    }
  }

  @media screen and (max-width: 1600px) {
    .item-container {
      grid-template-columns: repeat(5, 1fr) !important;
    }
  }
  @media screen and (max-width: 1300px) {
    .item-container {
      grid-template-columns: repeat(4, 1fr) !important;
    }
  }
  @media screen and (max-width: 1000px) {
    .item-container {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "start":"Start from scratch",
    "msg": "Add & arrange video clips and images to build your video",
    "addMedia": "Add Media",
    "previous": "Previous Project",
    "Draft": "Draft"
  }
}
</i18n>
