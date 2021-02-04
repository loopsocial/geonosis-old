import api from "../api/apiPath";

export default {
  [`get|${api.materialList}`]: {
    total: 10,
    "rows|10": [
      {
        id: "@guid",
        name: "@name",
        "type|1": ["video", "image"],
        coverUrl: "@image('140x270', @hex, upload)",
        "duration|1000-100000": 1, //毫秒
        packageUrl: "@image('140x270', @hex, upload)",
        textSticker: "@integer(1,4).png",
        m3u8Url: ""
      }
    ]
  }
};
