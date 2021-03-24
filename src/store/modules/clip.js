// 该module与撤销栈相关
import { CLIP_TYPES } from "@/utils/Global";
import Vue from "vue";
const cloneDeep = require("clone-deep");

export default {
  namespaced: true,
  state: {
    videos: [],
    audios: [],
    captions: [],
    stickers: [],
    module: null, // 使用的module
    currentVideoUuid: null,
    videoWidth: 540,
    videoHeight: 960,
    alias: "",
    version: "1",
    loaded: false
  },
  mutations: {
    init(state, data) {
      state.videos = cloneDeep(data.videos || []);
      state.audios = cloneDeep(data.audios || []);
      state.captions = cloneDeep(data.captions || []);
      state.stickers = cloneDeep(data.stickers || []);
      state.videoHeight = data.videoHeighth || 960;
      state.videoWidth = data.videoWidth || 540;
      state.alias = data.alias;
      state.version = data.version || 1;
      state.loaded = true;
    },
    resetClips(state, { type, clips }) {
      switch (type) {
        case CLIP_TYPES.VIDEO:
          state.videos = clips;
          state.currentVideoUuid =
            state.videos[0] && state.videos[0].uuid + `_0`;
          break;
        case CLIP_TYPES.AUDIO:
          state.audios = clips;
          break;
        case CLIP_TYPES.CAPTION:
          state.captions = clips;
          break;
        case CLIP_TYPES.STICKER:
          state.stickers = clips;
          break;
        default:
          break;
      }
    },
    addClipToVuex(state, clips) {
      if (!clips) return;
      if (!Array.isArray(clips)) {
        clips = [clips];
      }
      const type = clips[0].type;
      switch (type) {
        case CLIP_TYPES.VIDEO:
          state.videos.push(...clips);
          state.currentVideoUuid = state.videos[0].uuid + "_0";
          break;
        case CLIP_TYPES.AUDIO:
          state.audios.push(...clips);
          break;
        case CLIP_TYPES.CAPTION:
          state.captions.push(...clips);
          break;
        case CLIP_TYPES.STICKER:
          state.stickers.push(...clips);
          break;
        default:
          break;
      }
    },
    setModule(state, module) {
      state.module = cloneDeep(module);
    },
    updateClipToVuex(state, value) {
      let index = -1;
      const type = value.type;
      switch (type) {
        case CLIP_TYPES.VIDEO:
          index = state.videos.findIndex(item => item.uuid === value.uuid);
          Vue.set(state.videos, index, value);
          computedInPoint(state.videos);
          break;
        case CLIP_TYPES.AUDIO:
          index = state.audios.findIndex(item => item.uuid === value.uuid);
          Vue.set(state.audios, index, value);
          break;
        case CLIP_TYPES.CAPTION:
          index = state.captions.findIndex(item => item.uuid === value.uuid);
          Vue.set(state.captions, index, value);
          break;
        case CLIP_TYPES.STICKER:
          index = state.stickers.findIndex(item => item.uuid === value.uuid);
          Vue.set(state.stickers, index, value);
          break;
        default:
          break;
      }
    },
    deleteClipToVuex(state, { type, index }) {
      switch (type) {
        case CLIP_TYPES.VIDEO:
          Vue.delete(state.videos, index);
          break;
        case CLIP_TYPES.AUDIO:
          Vue.delete(state.audios, index);
          break;
        case CLIP_TYPES.CAPTION:
          Vue.delete(state.captions, index);
          break;
        case CLIP_TYPES.STICKER:
          Vue.delete(state.stickers, index);
          break;
        default:
          break;
      }
    },
    setCurrentVideoUuid(state, uuid) {
      state.currentVideoUuid = uuid;
    }
  }
};
// 重新计算视频的inPoint
function computedInPoint(clips) {
  clips.reduce((inPoint, video) => {
    video.inPoint = inPoint;
    inPoint += video.splitList.reduce((duration, item) => {
      const d = item.captureOut - item.captureIn;
      duration += d;
      return duration;
    }, 0);
    return inPoint;
  }, 0);
}
