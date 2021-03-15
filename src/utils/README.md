## Module XML 解析后的JSON格式
每个scene表示一个视频槽，scene内layer（raw)表示视频（或图片）的缩放、位置信息，layer(module)表示视频槽内的字幕（可能有多个），image表示字幕的背景图片

每个视频槽内，字幕的入点等于视频的入点（`caption.inPoint == video.inPoint`)，除非字幕有`duration`，否则字幕的长度等于视频长度（`caption.duration == video.duration`)

`scene.temporal` 含义：
- intro 片头对应的视频槽
- out 片尾对应的视频槽
- 空 出去片头、片尾的部分

具体应用效果查看文档
```
[
    {
        "alias": "Beauty-1", 
        "id": "beauty-0001", 
        "scenes": [
            {
                "temporal": "intro", 
                "layers": [
                    {
                        "type": "raw", 
                        "video": {
                            "scaleX": "0.8", 
                            "scaleY": "0.8", 
                            "translationX": "0", 
                            "translationY": "-0.098"
                        }, 
                        "image": {
                            "scaleX": "0.8", 
                            "scaleY": "0.8", 
                            "translationX": "0", 
                            "translationY": "-0.098", 
                            "source": { }
                        }
                    }, 
                    {
                        "type": "module", 
                        "text": [
                            {
                                "textXAlignment": "center", 
                                "font": "http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Avenir-Medium.ttf", 
                                "fontSize": "38", 
                                "fontColor": "#ffffffff", 
                                "translationX": "0", 
                                "translationY": "0", 
                                "zValue": "1", 
                                "value": "BEAUTY"
                            },
                            {
                                "textXAlignment": "center", 
                                "font": "http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Avenir-Medium.ttf", 
                                "fontSize": "38", 
                                "fontColor": "#ffffffff", 
                                "translationX": "0", 
                                "translationY": "0", 
                                "zValue": "1", 
                                "value": "BEAUTY - 2"
                            }
                        ]
                    }
                ]
            }, 
            {
                "temporal": "out", 
                "layers": [
                    {
                        "type": "module", 
                        "text": [
                            {
                                "textXAlignment": "center", 
                                "font": "http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Avenir-Medium.ttf", 
                                "fontSize": "38", 
                                "fontColor": "#ffffffff", 
                                "translationX": "0", 
                                "translationY": "0", 
                                "zValue": "1", 
                                "value": "BEAUTY"
                            }
                        ]
                    }
                ]
            }
        ]
    }
]
```
## 工程XML 与 vuex 中数据转换
### 写工程XML（vuex -> XML)
先将vuex中的数据转换成`中间结构`, 使用`XmlUtils.transformation()`，返回的数据结构如下
```
{
  "videoWidth": 540, 
  "videoHeight": 960, 
  "version": 1, 
  "alias": "Meme-2",
  "scenes": [
    {
      "video": {
        "inPoint": 0, 
        "duration": 3000000, 
        "trimIn": 0, 
        "trimOut": 3000000, 
        "scaleX": 1, 
        "scaleY": 1, 
        "translationX": 0, 
        "translationY": 0, 
        "source": {
          "src": "http://alieasset.meishesdk.com/video/141/feb43423-cf9a-4b59-a52b-0c7094bfb8a9.jpeg", 
          "width": -1, 
          "height": -1
        }
      }, 
      "captions": [
        {
          "zValue": 1, 
          "fontColor": "", 
          "translationX": 0, 
          "translationY": 0, 
          "scaleX": 1, 
          "scaleY": 1, 
          "frameWidth": "", 
          "frameHeight": "", 
          "duration": 3000000, 
          "value": "caption", 
          "textXAlignment": "center", 
          "font": ""
        }
      ]
    }, 
    {
      "video": {
        "inPoint": 3000000, 
        "duration": 15000000, 
        "trimIn": 0, 
        "trimOut": 15000000, 
        "scaleX": 1, 
        "scaleY": 1, 
        "translationX": 0, 
        "translationY": 0, 
        "source": {
          "src": "https://alieasset.meishesdk.com/video/2/segmentation.mp4", 
          "width": 0, 
          "height": 0
        }
      }, 
      "captions": [
        {
          "zValue": 1, 
          "fontColor": "", 
          "translationX": 0, 
          "translationY": 0, 
          "scaleX": 1, 
          "scaleY": 1, 
          "frameWidth": "", 
          "frameHeight": "", 
          "duration": 3000000, 
          "value": "caption", 
          "textXAlignment": "center", 
          "font": ""
        }, 
        {
          "zValue": 1, 
          "fontColor": "", 
          "translationX": 50.858184814453125, 
          "translationY": 151.58167171478271, 
          "scaleX": 1, 
          "scaleY": 1, 
          "frameWidth": "", 
          "frameHeight": "", 
          "duration": 3000000, 
          "value": "caption", 
          "textXAlignment": "center", 
          "font": ""
        }
      ]
    }
  ]
}
```
### 读取工程XML（XML -> vuex)
直接读写