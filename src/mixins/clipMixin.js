import { mapState, mapMutations, mapActions } from "vuex";
export default {
  computed: {
    ...mapState({
      videos: state => state.clip.videos,
      audios: state => state.clip.audios,
      images: state => state.clip.images,
      captions: state => state.clip.captions,
      stickers: state => state.clip.stickers,
      videoModule: state => state.clip.videoModule,
      vuexLoaded: state => state.clip.loaded
    }),
    currentVideoUuid: {
      get() {
        return this.$store.state.clip.currentVideoUuid;
      },
      set(uuid) {
        this.$store.commit("clip/setCurrentVideoUuid", uuid);
      }
    },
    currentModuleId: {
      get() {
        return this.$store.state.clip.currentModuleId;
      },
      set(uuid) {
        this.$store.commit("clip/setCurrentModuleId", uuid);
      }
    }
  },
  methods: {
    ...mapMutations({
      changeVuexLoaded: "clip/changeLoaded",
      addClipToVuex: "clip/addClipToVuex",
      deleteClipToVuex: "clip/deleteClipToVuex",
      updateClipToVuex: "clip/updateClipToVuex",
      resetClips: "clip/resetClips",
      initVuex: "clip/init",
      // setVideoModule: "clip/setVideoModule",
      clearIsModuleDate: "clip/clearIsModuleDate",
      clearModuleDate: "clip/clearModuleDate",
      resetLoaded: "clip/resetLoaded",
      addMultipleClipToVuex: "clip/addMultipleClipToVuex"
    }),
    ...mapActions({
      setVideoModule: "clip/setVideoModule"
    })
  }
};
