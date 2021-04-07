<template>
  <div class="font-panel">
    <i class="el-icon-arrow-left back-icon" @click="$emit('close')"></i>
    <el-row :gutter="7" class="scale">
      <el-col :span="12" class="animation-wrapper">
        <div class="animation box">
          <div class="title">
            <span>{{ $t("animation") }}</span>
          </div>
          <div class="content">
            <el-select
              class="ln-select font-select"
              v-model="animation"
              popper-class="ln-select-popper"
              placeholder=""
            >
              <el-option
                v-for="item in []"
                :key="item.id"
                :label="item.label"
                :disabled="item.installing"
                :value="item.stringValue"
              >
                <span style="float: left">{{ item.label }}</span>
                <i class="el-icon-loading" v-if="item.installing"></i>
              </el-option>
            </el-select>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="scale-wrapper">
        <div class="scale box">
          <div class="title">
            {{ $t("scale") }}
            <div class="scale-value flex">{{ clip.scale | toPercentage }}</div>
          </div>
          <el-slider
            v-model="clip.scale"
            :show-tooltip="false"
            @change="changeScale"
            :max="5"
            :min="0"
            :step="0.01"
            class="flex ln-slider"
          ></el-slider>
        </div>
      </el-col>
    </el-row>
    <el-row class="font" v-if="clip && clip.type === 'caption'">
      <el-col class="font-wrapper" :gutter="7">
        <div class="font box">
          <div class="title">{{ $t("font") }}</div>
          <div class="content">
            <el-select
              class="ln-select font-select"
              v-model="clip.font"
              @change="changeFont"
              popper-class="ln-select-popper"
              placeholder=""
            >
              <el-option
                v-for="item in fonts"
                :key="item.id"
                :label="item.label"
                :disabled="item.installing"
                :value="item.stringValue"
              >
                <span style="float: left">{{ item.label }}</span>
                <i class="el-icon-loading" v-if="item.installing"></i>
              </el-option>
            </el-select>

            <el-radio-group
              v-model="clip.align"
              class="ln-radio-group"
              @change="changeAlign"
            >
              <el-radio-button label="left">
                <svg-icon
                  class="align-icon icon-border"
                  :icon-class="
                    clip.align === 'left' ? 'align-left-active' : 'align-left'
                  "
                  ref="align"
                ></svg-icon>
              </el-radio-button>
              <el-radio-button label="center">
                <svg-icon
                  class="align-icon icon-border"
                  :icon-class="
                    clip.align === 'center'
                      ? 'align-center-active'
                      : 'align-center'
                  "
                  ref="align"
                ></svg-icon>
              </el-radio-button>
              <el-radio-button label="right">
                <svg-icon
                  class="align-icon"
                  :icon-class="
                    clip.align === 'right'
                      ? 'align-right-active'
                      : 'align-right'
                  "
                  ref="align"
                ></svg-icon>
              </el-radio-button>
            </el-radio-group>

            <div class="color-options">
              <div class="text-color">
                {{ $t("textColor") }}
                <el-color-picker
                  v-model="clip.color"
                  show-alpha
                  size="mini"
                  :predefine="predefineColors"
                  class="ln-color-picker"
                  @change="changeColor"
                ></el-color-picker>
              </div>
              <div class="bg-color">
                {{ $t("backgroundColor") }}
                <el-color-picker
                  v-model="clip.backgroundColor"
                  show-alpha
                  size="mini"
                  class="ln-color-picker"
                  :predefine="predefineColors"
                  @change="changeBackground"
                ></el-color-picker>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="7" class="duration">
      <el-col :span="12" class="wrapper">
        <div class="box">
          <div class="title">
            <span>{{ $t("duration") }}</span>
          </div>
          <div class="duration-bar flex">
            <svg-icon
              @click="changeDuration(-1)"
              class="duration-modify-icon"
              icon-class="minus"
            ></svg-icon>

            <span class="duration-text white">{{
              clip.duration | msFormat2
            }}</span>
            <svg-icon
              @click="changeDuration(1)"
              class="duration-modify-icon"
              icon-class="plus"
            ></svg-icon>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
import { DEFAULT_FONT, TEXT_ALIGN, CLIP_TYPES } from "@/utils/Global";
import { RGBAToNvsColor } from "@/utils/common";
export default {
  props: {
    clip: Object
  },
  data() {
    return {
      fonts: [],
      animation: "Default",
      predefineColors: [
        "#ff0100",
        "#ff5050",
        "#02b050",
        "#50e3de",
        "#a400c5",
        "#5b20f3",
        "#000000",
        "#4a4a4a",
        "#9b9b9b",
        "#ffffff"
      ]
    };
  },
  filters: {
    toPercentage(v) {
      return (v * 100).toFixed() + "%";
    }
  },
  computed: {},
  mounted() {
    console.log(this.clip);
    this.installFont();
  },
  methods: {
    changeDuration(v) {
      this.clip.duration += v * 1000000;
      const outPoint = this.clip.inPoint + this.clip.duration;
      this.clip.raw.changeOutPoint(outPoint);
      this.$bus.$emit(this.$keys.seek);
      this.updateClipToVuex(this.clip);
    },
    async installFont() {
      // const res = await this.axios.get(this.$api.materials, {
      //   params: {
      //     type: 6,
      //     page: 0,
      //     pageSize: 20
      //   }
      // });
      // this.fonts = res.data.materialList.map(item => {
      //   if (item.stringValue === DEFAULT_FONT) {
      //     item.installing = false;
      //   } else {
      //     item.installing = true;
      //     installAsset(item.packageUrl).then(() => {
      //       item.installing = false;
      //     });
      //   }
      //   item.label = item.displayName;
      //   return item;
      // });
    },
    changeFont(e) {
      const font = this.fonts.find(f => f.stringValue === e);
      this.clip.fontUrl = font.packageUrl;
      this.clip.raw.setFontFamily(this.clip.font);
      this.$bus.$emit(this.$keys.seek);
      this.updateClipToVuex(this.clip);
    },
    changeColor(color) {
      color = RGBAToNvsColor(color);
      this.clip.raw.setTextColor(color);
      this.$bus.$emit(this.$keys.seek);
      this.updateClipToVuex(this.clip);
    },
    changeBackground(color) {
      color = RGBAToNvsColor(color);
      this.clip.raw.setBackgroundColor(color);
      this.$bus.$emit(this.$keys.seek);
      this.updateClipToVuex(this.clip);
    },
    changeAlign(e) {
      this.clip.raw.setTextAlignment(TEXT_ALIGN[e]);
      this.$bus.$emit(this.$keys.seek);
      this.updateClipToVuex(this.clip);
    },
    changeScale(scale) {
      if (this.clip.type === CLIP_TYPES.STICKER) {
        this.clip.raw.setScale(scale);
      } else if (this.clip.type === CLIP_TYPES.CAPTION) {
        this.clip.raw.setScaleX(scale);
        this.clip.raw.setScaleY(scale);
      }
      this.$bus.$emit(this.$keys.seek);
      this.$bus.$emit(this.$keys.drawBox);
      this.updateClipToVuex(this.clip);
    }
  }
};
</script>

<style lang="scss">
.font-panel {
  margin-right: 65px;
  .back-icon {
    font-size: 20px;
    color: white;
    margin: 20px 0 20px 8px;
    font-weight: bolder;
    cursor: pointer;
  }
  .el-row {
    width: 100%;
  }
  .el-row.scale {
    .el-col > div {
      height: 9.2vw;
    }
    .title {
      position: relative;
    }
    .scale-value {
      position: absolute;
      right: 0;
      top: 0;
      width: 44px;
      height: 22px;
      border: 1px solid #000;
      background-color: #2b2b2b;
      border-radius: 4px;
    }
    .el-slider {
      height: calc(100% - 29px);
    }
  }
  .el-row.font {
    padding-right: 7px;
    margin-top: 7px;
    .el-col > div {
      // height: 21.5vw;
    }
    .content {
      margin-top: 12px;
      .el-checkbox-group {
        width: 139px;
        height: 36px;
        background-color: rgb(65, 65, 65);
        border-radius: 6px;
      }
      .color-options {
        & > div {
          line-height: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ln-color-picker {
          ::v-deep {
            .el-color-picker__trigger {
              height: 20px;
              width: 20px;
              vertical-align: middle;
            }
          }
        }
      }
    }
  }
  .duration {
    margin-top: 7px;
    .duration-bar {
      padding: 16px 0;
    }
    .duration-modify-icon {
      width: 24px;
      height: 24px;
    }
    .duration-text {
      margin: 0 12px;
    }
  }
  .animation {
    display: flex;
    flex-direction: column;
    .content {
      display: flex;
      align-items: center;
      flex: 1;
    }
  }
  .box {
    padding: 7px 10px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 14px;
    border-radius: 6px;
    .title {
      height: 29px;
      width: 100%;
      border-bottom: 1px solid #6b6b6b;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "duration": "Duration",
    "font": "Font",
    "animation": "Animation",
    "scale": "Scale",
    "textColor": "Text Color",
    "backgroundColor": "Background Color"
  }
}
</i18n>
