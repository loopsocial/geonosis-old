module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "eslint:recommended", "@vue/prettier"],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off"
  },
  globals: {
    NvsVideoResolution: true,
    NvsRational: true,
    NvsStreamingEngineStateEnum: true,
    NvsLiveWindowFillModeEnum: true,
    NvsVideoPreviewSizeModeEnum: true,
    NvsAudioResolution: true,
    NvsClipRoleInThemeEnum: true,
    NvsCaptionRoleInThemeEnum: true,
    nvsResumeAudioContext: true,
    FS: true,
    nvsGetStreamingContextInstance: true,
    WASMLoader: true,
    Module: true,
    videojs: true,
    NvsXmlStreamWriter: true,
    NvsXmlStreamReader: true,
    NvsTimeline: true,
    NvsPointF: true,
    NvsXmlStreamWriter: true,
    NvsTimeline: true,
    NvsPointF: true,
    NvsAssetPackageStatusEnum: true,
    NvsSeekFlagEnum: true,
    NvsColor: true,
    NvsVectorFloat: true
  }
};
