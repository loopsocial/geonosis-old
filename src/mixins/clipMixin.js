import { mapState, mapMutations } from "vuex";
export default {
  computed: {
    ...mapState({
      videos: state => state.clip.videos,
      audios: state => state.clip.audios,
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
      setVideoModule: "clip/setVideoModule",
      resetLoaded: "clip/resetLoaded"
    })
  }
};
