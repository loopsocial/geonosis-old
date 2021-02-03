import api from "../api/apiHost";

export default {
  [`get|${api.uploadList}`]: {
    total: 100,
    "rows|20": [
      {
        id: "@guid",
        name: "@name",
        "type|1": ["video", "image"],
        coverUrl: "@image('140x270', @hex, upload)",
        "duration|1000-100000": 1 //毫秒
      }
    ]
  },
  [`get|${api.libraryList}`]: {
    total: 100,
    "rows|20": [
      {
        id: "@guid",
        name: "@name",
        "type|1": ["video", "image"],
        coverUrl: "@image('140x270', @hex, Library)",
        "duration|1000-100000": 1
      }
    ]
  }
};
