<template>
  <div class="font-panel">
    <el-row :gutter="7">
      <el-col :span="12" class="animation-wrapper">
        <div class="animation box">
          <div class="title">
            <span>{{ $t("animation") }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="12" class="scale-wrapper">
        <div class="scale box">
          <div class="title">
            {{ $t("scale") }}
            <div class="scale-value flex">{{ scale }}%</div>
          </div>
          <el-slider
            v-model="scale"
            :show-tooltip="false"
            class="flex"
          ></el-slider>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col class="font-wrapper" :gutter="7">
        <div class="font box">
          <div class="title">{{ $t("font") }}</div>
          <div class="content">
            <el-select class="ln-select">
              <el-option></el-option>
            </el-select>
            <el-checkbox-group v-model="alignType" class="ln-checkbox-group">
              <el-checkbox-button>
                <svg-icon
                  class="align-icon"
                  icon-class="align-left"
                  ref="align"
                ></svg-icon>
              </el-checkbox-button>
              <el-checkbox-button>
                <svg-icon
                  class="align-icon"
                  icon-class="align-center"
                  ref="align"
                ></svg-icon>
              </el-checkbox-button>
              <el-checkbox-button>
                <svg-icon
                  class="align-icon"
                  icon-class="align-right"
                  ref="align"
                ></svg-icon>
              </el-checkbox-button>
            </el-checkbox-group>
            <div class="color-options">
              <div class="text-color">
                {{ $t("textColor") }}
                <el-color-picker
                  v-model="color"
                  show-alpha
                  class="ln-color-picker"
                ></el-color-picker>
              </div>
              <div class="bg-color">
                {{ $t("backgroundColor") }}
                <el-color-picker
                  v-model="color"
                  show-alpha
                  class="ln-color-picker"
                ></el-color-picker>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      scale: 0,
      alignType: ""
    };
  },
  mounted() {
    console.log(this.$refs.align);
  }
};
</script>

<style lang="scss" scoped>
.font-panel {
  margin-right: 65px;
  .el-row {
    width: 100%;
  }
  .el-row:nth-child(1) {
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
  .el-row:nth-child(2) {
    padding-right: 7px;
    margin-top: 7px;
    .el-col > div {
      height: 21.5vw;
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
