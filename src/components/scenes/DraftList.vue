<template>
  <div class="draft-list">
    <div class="draft-list-container">
      <div class="draft-list-item">
        <div class="draft-list-item-content onfocus">
          <div class="cover-info">
            <div class="order-number">1</div>
            <div class="duration">00:12</div>
            <div class="operate-btns">
              <svg-icon class="cut-icon" icon-class="cut"></svg-icon>
              <svg-icon class="delete-icon" icon-class="trash"></svg-icon>
            </div>
          </div>
        </div>
      </div>

      <div class="draft-list-item">
        <div class="draft-list-item-content onfocus">
          <div class="cover-info">
            <div class="order-number">2</div>
            <div class="duration">00:13</div>
            <div class="operate-btns">
              <svg-icon class="cut-icon" icon-class="cut"></svg-icon>
              <svg-icon class="delete-icon" icon-class="trash"></svg-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="add-media-btn flex">
      <svg-icon class="add-icon" icon-class="plus"></svg-icon>
      <span class="add-text">{{ $t("addMedia") }}</span>
    </div>
  </div>
</template>

<script>
// import DraftListItem from "./DraftListItem";
export default {
  components: {
    // DraftListItem
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    handleResize() {}
  },
  beforeDestroy() {}
};
</script>

<style lang="scss" scoped>
$infoBgc: rgba(0, 0, 0, 0.5);
$white: #fff;
.draft-list {
  height: 100%;
  position: relative;
  /* Hide scrollbar for Chrome, Safari and Opera */
  .draft-list-container {
    &::-webkit-scrollbar {
      display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    position: relative;
    height: 100%;
    width: 100%;
    background-color: #2b2b2b;
    border-radius: 12px;
    overflow-y: auto;

    .draft-list-item {
      padding: 12px;
      .onfocus {
        border: 2px solid $white !important;
      }
      .draft-list-item-content {
        position: relative;
        padding-bottom: 100%;
        border-radius: 12px;
        border: 2px solid transparent;
        .cover-info {
          position: absolute;
          width: 100%;
          height: 100%;
          font-weight: bold;
          font-size: 1.5vw;

          .order-number {
            margin: 6px 0 0 4px;
            width: 2em;
            height: 2em;
            line-height: 2em;
            text-align: center;
            background-color: $infoBgc;
            border-radius: 50%;
            color: $white;
          }
          .duration {
            position: absolute;
            right: 3.07%;
            top: 6px;
            padding: 4% 5% 3% 5%;
            background-color: $infoBgc;
            border-radius: 6px;
            color: $white;
          }
          .cut-icon {
            position: absolute;
            bottom: 5%;
            left: 9.54%;
            width: 30%;
            height: 23%;
            cursor: pointer;
          }
          .delete-icon {
            position: absolute;
            bottom: 10%;
            right: 10%;
            width: 18%;
            height: 13%;
            cursor: pointer;
          }
        }
      }
    }
  }

  .add-media-btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 12px;
    width: 81.8%;
    height: 5vw;
    border-radius: 6vw;
    background-color: #474747;
    line-height: 46px;
    white-space: nowrap;
    cursor: pointer;
    .add-icon {
      display: inline-block;
      height: 3.5vw;
      width: 3.5vw;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      vertical-align: middle;
    }
    .add-text {
      margin-right: 6%;
      font-size: 1.4vw;
      color: $white;
      font-weight: 600;
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
