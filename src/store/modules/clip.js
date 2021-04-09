// 该module与撤销栈相关
import { CLIP_TYPES } from "@/utils/Global";
import { CaptionClip, StickerClip } from "@/utils/ProjectData";
import Vue from "vue";
const cloneDeep = require("clone-deep");

export default {
  namespaced: true,
  state: {
    videos: [],
    audios: [],
    captions: [],
    stickers: [],
    images: [], // 模板里 放图片的轨道内容
    videoModule: null, // 使用的module
    currentModuleId: null, // 正在使用的module id
    currentVideoUuid: null,
    videoWidth: 1080,
    videoHeight: 1920,
    alias: "",
    version: "1",
    loaded: false,
    videoProject: {}
  },
  mutations: {
    setCurrentModuleId(state, id) {
      state.currentModuleId = id;
    },
    changeLoaded(state, payload) {
      state.loaded = payload;
    },
    init(state, data = {}) {
      state.videos = cloneDeep(data.videos || []);
      state.audios = cloneDeep(data.audios || []);
      state.captions = cloneDeep(data.captions || []);
      state.images = cloneDeep(data.images || []);
      state.stickers = cloneDeep(data.stickers || []);
      state.videoModule = cloneDeep(data.videoModule || data.module || {});
      state.videoHeight = data.videoHeighth || 1920;
      state.videoWidth = data.videoWidth || 1080;
      state.alias = data.alias;
      state.version = data.version || 1;
      state.currentModuleId = data.currentModuleId;
      state.loaded = true;
    },
    resetLoaded(state) {
      state.loaded = false;
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
    addMultipleClipToVuex(state, object) {
      if (object.needClear) {
        state.videoModule = null;
        state.captions = state.captions.filter(c => !c.isModule);
        state.stickers = state.stickers.filter(s => !s.isModule);
        state.images = [];
      }
      for (const key in object) {
        if (Object.hasOwnProperty.call(object, key)) {
          const value = cloneDeep(object[key]);
          if (key === "needClear") continue;
          if (Array.isArray(value)) {
            state[key].push(...value);
          } else {
            state[key] = value;
          }
        }
      }
    },
    setVideoModule(state, module) {
      if (module) {
        state.videoModule = cloneDeep(module);
      }
    },
    updateClipToVuex(state, value) {
      let index = -1;
      const type = value.type;
      switch (type) {
        case CLIP_TYPES.VIDEO:
          index = state.videos.findIndex(item => item.uuid === value.uuid);
          Vue.set(state.videos, index, value);
          computedInPoint(state.videos, state.captions, state.stickers);
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
      const { VIDEO, AUDIO, CAPTION, STICKER } = CLIP_TYPES;
      if (type === VIDEO) {
        beforeDel(state, index);
      } else if (type === AUDIO) {
        Vue.delete(state.audios, index);
      } else if (type === CAPTION) {
        const target = state.captions[index];
        if (target.isModule) {
          target.deleted = true;
        } else {
          Vue.delete(state.captions, index);
        }
      } else if (type === STICKER) {
        const target = state.stickers[index];
        if (target.isModule) {
          target.deleted = true;
        } else {
          Vue.delete(state.stickers, index);
        }
      }
    },
    setCurrentVideoUuid(state, uuid) {
      state.currentVideoUuid = uuid;
    },
    clearModuleDate(state) {
      state.videoModule = null;
      state.captions = state.captions.filter(c => !c.isModule);
      state.stickers = state.stickers.filter(s => !s.isModule);
      state.images = [];
      state.currentModuleId = null;
    },
    clearIsModuleDate(state) {
      state.captions = state.captions.filter(c => !c.isModule);
      state.stickers = state.stickers.filter(s => !s.isModule);
    },
    setVideoProject(state, project) {
      state.videoProject = project;
    }
  },
  actions: {
    setVideoModule({ commit }, module) {
      commit("clearModuleDate");
      if (module) {
        commit("setVideoModule", module);
      }
    },
    setVideoProject({ commit }, project) {
      if (project) commit("setVideoProject", project);
    }
  }
};
// 视频split、修改trim后重新计算
function computedInPoint(clips, captions, stickers) {
  clips.reduce((inPoint, video) => {
    video.inPoint = inPoint;
    const vDuration =
      video.splitList[0].captureOut - video.splitList[0].captureIn;
    // 处理字幕
    const cas = captions.filter(c => c.inPoint === inPoint);
    cas.map(c => {
      if (c.duration > vDuration) {
        const index = captions.indexOf(c);
        const spliceCaption = [
          new CaptionClip({ ...c, inPoint, duration: vDuration }),
          new CaptionClip({
            ...c,
            inPoint: inPoint + vDuration,
            duration: c.duration - vDuration
          })
        ];
        captions.splice(index, 1, ...spliceCaption);
      }
    });
    // 处理贴纸
    const sts = stickers.filter(c => c.inPoint === inPoint);
    sts.map(c => {
      if (c.duration > vDuration) {
        const index = captions.indexOf(c);
        const spliceSticker = [
          new StickerClip({ ...c, inPoint, duration: vDuration }),
          new StickerClip({
            ...c,
            inPoint: inPoint + vDuration,
            duration: c.duration - vDuration
          })
        ];
        stickers.splice(index, 1, ...spliceSticker);
      }
    });
    inPoint += video.splitList.reduce((duration, item) => {
      const d = item.captureOut - item.captureIn;
      duration += d;
      return duration;
    }, 0);
    return inPoint;
  }, 0);
}
// 视频删除后，重新计算
function beforeDel(state, index) {
  const { inPoint, splitList } = state.videos[index];
  const { videos, captions, stickers } = state;
  const vDuration = splitList[0].captureOut - splitList[0].captureIn;
  // 删除对应的字幕, 之后的字幕往前移动
  for (let i = 0; i < captions.length; i++) {
    const c = captions[i];
    if (c.inPoint === inPoint) {
      state.captions.splice(i, 1);
      i--;
    } else if (c.inPoint > inPoint) {
      state.captions[i].inPoint -= vDuration;
    }
  }
  // 删除对应的贴纸, 之后的贴纸往前移动
  for (let i = 0; i < stickers.length; i++) {
    const s = stickers[i];
    if (s.inPoint === inPoint) {
      state.stickers.splice(i, 1);
      i--;
    } else if (s.inPoint > inPoint) {
      state.stickers[i].inPoint -= vDuration;
    }
  }
  // 删除视频，并且后面的视频往前放
  state.videos.splice(index, 1);
  for (let i = index; i < videos.length; i++) {
    let inPoint = 0;
    if (videos[i - 1]) {
      const { inPoint: preIn, splitList: preSplit } = videos[i - 1];
      inPoint = preIn + preSplit[0].captureOut - preSplit[0].captureIn;
    }
    state.videos[i].inPoint = inPoint;
  }
}
