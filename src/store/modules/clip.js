// 该module与撤销栈相关
import { CLIP_TYPES } from "@/utils/Global";
import Vue from "vue";
export default {
  namespaced: true,
  state: {
    videos: [],
    audios: [],
    captions: [],
    stickers: [],
    currentVideoUuid: null
  },
  mutations: {
    resetClips(state, clips) {
      if (!clips.length) return;
      const type = clips[0].type;
      switch (type) {
        case CLIP_TYPES.VIDEO:
          state.videos = clips;
          state.currentVideoUuid = state.videos[0].uuid;
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
      if (!Array.isArray(clips)) {
        clips = [clips];
      }
      const type = clips[0].type;
      switch (type) {
        case CLIP_TYPES.VIDEO:
          state.videos.push(...clips);
          state.currentVideoUuid = state.videos[0].uuid;
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
    updateClipToVuex(state, value) {
      let index = -1;
      const type = value.type;
      switch (type) {
        case CLIP_TYPES.VIDEO:
          index = state.videos.findIndex(item => item.uuid === value.uuid);
          Vue.set(state.videos, index, value);
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
