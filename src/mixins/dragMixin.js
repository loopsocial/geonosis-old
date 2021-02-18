export default {
  computed: {
    draggingStyle: {
      get() {
        return this.$store.draggable.style;
      },
      set(style) {
        this.$store.commit("draggable/changeStyle", style);
      }
    },
    isDragging: {
      get() {
        return this.$store.draggable.isDragging;
      },
      set(dragging) {
        this.$store.commit("draggable/changeDragVisible", dragging);
      }
    },
    draggingClip: {
      get() {
        return this.$store.draggable.draggingClip;
      },
      set(clip) {
        this.$store.commit("draggable/setDraggingClip", clip);
      }
    }
  },
  methods: {}
};
