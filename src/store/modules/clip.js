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
    addClipToVuex(state, { type, clip }) {
      switch (type) {
        case CLIP_TYPES.VIDEO:
          state.videos.push(clip);
          state.currentVideoUuid = state.videos[0].uuid;
          break;
        case CLIP_TYPES.AUDIO:
          state.audios.push(clip);
          break;
        case CLIP_TYPES.CAPTION:
          state.captions.push(clip);
          break;
        case CLIP_TYPES.STICKER:
          state.stickers.push(clip);
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
