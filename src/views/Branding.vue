<template>
  <div class="branding">
    <div class="preset-list-wrapper">
      <div class="preset-add flex" @click="handleAddNewPreset">
        <svg-icon
          @click.prevent="handleDurationChange('outro', 'plus')"
          class="plus-btn margin-right-12"
          icon-class="plus"
        ></svg-icon>
        {{ $t("addNewPreset") }}
      </div>
      <div class="preset-list">
        <div
          class="preset-item branding-card"
          v-for="(project, idx) of projects"
        >
          <el-input
            v-if="idx === editingIdx"
            v-model.trim="project.name"
            class="ln-input"
            @keydown.enter.native="handleEditName(idx, true)"
          ></el-input>
          <div v-else>{{ project.name }}</div>
          <svg-icon
            class="edit-btn"
            icon-class="edit"
            @click.prevent="handleEditName(idx)"
          ></svg-icon>
        </div>
      </div>
    </div>
    <div class="preset-options">
      <BrandCard class="brand-logo" :title="$t('brandLogo')">
        <el-upload
          class="upload-demo"
          action="#"
          :on-change="handleChange"
          :file-list="fileList"
          :show-file-list="false"
          accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PBG,.GIF,.BMP"
          :auto-upload="false"
        >
          <div slot="trigger" @click="handleLogoUpload">
            <svg-icon
              class="upload-btn margin-top-10"
              icon-class="upload"
            ></svg-icon>
            <span>{{ $t("upload") }}</span>
          </div>
        </el-upload>

        <template #content>
          <div class="logo-images">
            <img
              :src="getImageSrc(image.raw)"
              v-for="(image, idx) of fileList"
            />
          </div>
        </template>
      </BrandCard>
      <BrandCard class="brand-color" :title="$t('brandColors')">
        <template #content>
          <div class="color-pickers margin-top-25">
            <el-color-picker
              class="reset-el-color-picker"
              v-model="color1"
              show-alpha
            ></el-color-picker>
            <el-color-picker
              class="reset-el-color-picker"
              v-model="color2"
              show-alpha
            ></el-color-picker>
            <el-color-picker
              class="reset-el-color-picker"
              v-model="color3"
              show-alpha
            ></el-color-picker>
          </div>
        </template>
      </BrandCard>
      <BrandCard class="brand-font" :title="$t('brandFonts')">
        <template #content>
          <div class="primary">
            <div class="type">{{ $t("primary") }}</div>
            <el-select v-model="primaryFont" class="ln-select"></el-select>
            <svg-icon class="upload-btn" icon-class="upload"></svg-icon>
          </div>
          <div class="secondary">
            <div class="type">{{ $t("secondary") }}</div>
            <el-select v-model="secondaryFont" class="ln-select"></el-select>
            <svg-icon class="upload-btn" icon-class="upload"></svg-icon>
          </div>
        </template>
      </BrandCard>
      <div class="transition">
        <BrandCard class="intro margin-right-4" :title="$t('intro')">
          <div class="branding-title-operate">
            <span class="operate-btn" @click="handleStandAlone">{{
              $t("overlay")
            }}</span>
          </div>
          <div class="content" slot="content">
            <div v-if="!fileList.length" class="empty-logo"></div>
            <img v-else :src="getImageSrc(fileList[0].raw || null)" />
            <div class="duration-setting flex">
              <svg-icon
                @click.prevent="handleDurationChange('intro', 'minus')"
                class="minus-btn"
                icon-class="minus"
              ></svg-icon>
              <span>{{ introDuration }}s</span>
              <svg-icon
                @click.prevent="handleDurationChange('intro', 'plus')"
                class="plus-btn"
                icon-class="plus"
              ></svg-icon>
            </div>
          </div>
        </BrandCard>
        <BrandCard class="outro margin-left-4" :title="$t('outro')">
          <!-- <el-button type="text">{{ $t("standAlone") }}</el-button> -->
          <div class="branding-title-operate">
            <span class="operate-btn" @click="handleStandAlone">{{
              $t("standAlone")
            }}</span>
          </div>
          <div class="content" slot="content">
            <div v-if="!fileList.length" class="empty-logo"></div>
            <img v-else :src="getImageSrc(fileList[0].raw || null)" />
            <div class="duration-setting flex">
              <svg-icon
                @click.prevent="handleDurationChange('outro', 'minus')"
                class="minus-btn"
                icon-class="minus"
              ></svg-icon>
              <span>{{ outroDuration }}s</span>
              <svg-icon
                @click.prevent="handleDurationChange('outro', 'plus')"
                class="plus-btn"
                icon-class="plus"
              ></svg-icon>
            </div>
          </div>
        </BrandCard>
      </div>
    </div>
    <div class="preset-preview-wrapper">
      <p>{{ $t("brandPresetPreview") }}</p>

      <div class="preset-preview">
        <div class="horizontal"></div>
        <div class="vertical-wrapper">
          <div class="vertical"></div>
          <div class="vertical-half"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BrandCard from "../components/branding/BrandingCard";
export default {
  components: {
    BrandCard
  },
  data() {
    return {
      color1: "",
      color2: "",
      color3: "",
      projects: [
        {
          name: "My Branding Preset 1"
        },
        {
          name: "My Branding Preset 1"
        },
        {
          name: "My Branding Preset 1"
        },
        {
          name: "My Branding Preset 1"
        },
        {
          name: "My Branding Preset 1"
        },
        {
          name: "My Branding Preset 1"
        },
        {
          name: "My Branding Preset 1"
        }
      ],
      fileList: [],
      primaryFont: "",
      secondaryFont: "",
      editingIdx: -1,
      introDuration: 0,
      outroDuration: 0
    };
  },
  methods: {
    handleAddNewPreset() {},
    handleEditName(idx, isPressedEnter) {
      console.log("idx", idx, isPressedEnter);
      this.editingIdx = this.editingIdx === idx ? -1 : idx;
      isPressedEnter && (this.editingIdx = -1);
    },
    handleLogoUpload() {},
    handleChange(curFile, fileList) {
      this.fileList = fileList;

      // console.log("e", args);
    },
    getImageSrc(fileRaw) {
      return URL.createObjectURL(fileRaw);
    },
    handleDurationChange(type, operate) {
      this[`${type}Duration`] =
        operate === "plus"
          ? this[`${type}Duration`] + 1
          : this[`${type}Duration`] - 1;
    },
    handleStandAlone() {}
  }
};
</script>

<style lang="scss" scoped>
.branding {
  display: grid;
  grid-template-columns: 0.71fr 1fr 1.2fr;
  width: 100%;
  padding-top: 15px;

  .preset-list-wrapper {
    position: relative;

    height: 100%;
    padding-left: 20px;
    padding-right: 17px;
    overflow: hidden;
    // width: 187px;
    .preset-list {
      height: 100%;
      overflow-y: auto;
      box-sizing: border-box;
      padding-bottom: 44px;

      &::-webkit-scrollbar {
        display: none;
      }
    }
    .preset-item {
      margin-bottom: 12px;
      display: table;
      padding-left: 12px;
      padding-right: 9px;
      padding-bottom: 0;
      height: 36px;
      color: $main-font-color;
      font-size: 14px;
      line-height: 36px;
      cursor: pointer;
      ::v-deep .el-input__inner {
        padding: 0;
        border: none;
        height: 100%;
        background: transparent;
      }
      &::before {
        display: table-column;
        width: 100%;
        content: "";
      }
      div {
        display: table-cell;
        max-width: 1px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    .preset-add {
      width: calc(100% - 50px);
      border-radius: 7px 12px 7px 12px;
      height: 36px;
      background-color: #2b2b2b;
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      color: $main-font-color;
      cursor: pointer;
    }
  }
  .preset-options {
    height: 100%;
    overflow: scroll;
    &::-webkit-scrollbar {
      display: none !important;
    }
    & > div {
      margin-bottom: 8px;
    }
    .upload-btn {
      margin-right: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
    }
    .brand-logo,
    .brand-color {
      min-height: 102px;

      .logo-images {
        margin-top: 10px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        img {
          width: 100%;
        }
      }
      .color-pickers {
        display: flex;
        width: 100%;
        height: 32px;
        background-color: #fff;
        .el-color-picker {
          flex: 1;
        }
      }
    }
    .brand-font {
      height: 148px;
      .primary,
      .secondary {
        & > div {
          display: inline-block;
        }
        margin-top: 13px;
        display: flex;
        align-items: center;

        .type {
          width: 80px;
          flex-shrink: 0;
          font-size: 12px;
          color: $font-color-gray;
        }
        .upload-btn {
          flex-shrink: 0;
          margin-left: 10px;
        }
      }
    }
    .transition {
      display: flex;
      ::v-deep .brand-title-text {
        margin-right: 10px;
      }
      .intro,
      .outro {
        min-height: 144px;
        flex: 1;
        font-size: 14px;
        font-weight: 200;

        .branding-title-operate {
          display: table;
          width: 100%;
          &::before {
            display: table-column;
            width: 100%;
            content: "";
          }
        }
      }
      .content {
        img {
          width: 100%;
          margin-top: 10px;
        }
      }
      .duration-setting {
        [class$="-icon"] {
          width: 22px;
          height: 22px;
          cursor: pointer;
        }
      }
      .operate-btn {
        display: table-cell;
        max-width: 1px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        cursor: pointer;
      }
      .intro {
        ::v-deep .branding-title-operate-wrapper {
          max-width: 53px;
          flex: 1;
        }
      }
      .outro {
        ::v-deep .branding-title-operate-wrapper {
          max-width: 78px;
          flex: 1;
        }
      }
      .empty-logo {
        margin: 10px 0;
        width: 100%;
        height: 100%;
        border: 1px dashed #fff;
        height: 100px;
        border-radius: 6px;
      }
    }
  }
  .preset-preview-wrapper {
    padding: 0 27px;
    color: $main-font-color;
    font-size: 14px;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;

    .preset-preview {
      overflow: auto;
      height: calc(100% - 40px);
      margin-top: 10px;
    }
    .horizontal {
      aspect-ratio: 21/9;
      width: 100%;
      border: 1px solid;
      border-radius: 6px;
      box-sizing: border-box;
    }
    .vertical-wrapper {
      margin-top: 12px;
      display: flex;
      justify-content: space-between;
      .vertical {
        aspect-ratio: 9/18;
        margin-top: 10px;
        width: calc(50% - 10px);

        border: 1px solid;
        border-radius: 6px;
      }
      .vertical-half {
        align-self: flex-start;
        aspect-ratio: 1/1;

        display: inline-block;
        margin-top: 10px;
        width: calc(50% - 10px);
        border: 1px solid;
        border-radius: 6px;
      }
    }
  }
}
</style>
