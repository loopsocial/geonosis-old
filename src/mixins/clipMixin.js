import { mapState, mapMutations } from "vuex";
export default {
  computed: {
    ...mapState({
      videos: state => state.clip.videos,
      audios: state => state.clip.audios,
      captions: state => state.clip.captions,
      stickers: state => state.clip.stickers
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
      addClipToVuex: "clip/addClipToVuex",
      deleteClipToVuex: "clip/deleteClipToVuex",
      updateClipToVuex: "clip/updateClipToVuex"
    })
  }
};
