export function writeModuleXml(path) {
  FS.writeFile(
    path || "t.xml",
    `<?xml version="1.0" encoding="utf-8"?>
<modules>
    <fw-creation
        alias="Meme-2"
        id="text-0002">
        <fw-scene>
            <fw-scene-layer type="raw">
                <fw-video
                    scale-x="1.0"
                    scale-y="1.0"
                    translation-x="0"
                    translation-y="0.125" />
                <fw-image
                    scale-x="1.0"
                    scale-y="1.0"
                    translation-x="0"
                    translation-y="0.125" />
            </fw-scene-layer>
            <fw-scene-layer type="module">
                <fw-text
                    text-x-alignment="center"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Modern_Abel-Regular.ttf"
                    font-size="40"
                    font-color="#ff000000"
                    frame-width="70%"
                    frame-height="10%"
                    translation-x="0"
                    translation-y="0.36"
                    value="An inspiring journey"
                    z-value="1" />
                <fw-image>
                    <source src="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/img/meme2.png" />
                </fw-image>
            </fw-scene-layer>
        </fw-scene>
    </fw-creation>
    <fw-creation
        alias="Story-2"
        id="text-0005">
        <fw-scene>
            <fw-scene-layer type="raw">
                <fw-video
                    scale-x="0.8"
                    scale-y="0.8"
                    translation-x="0"
                    translation-y="-0.098" />
                <fw-image
                    scale-x="0.8"
                    scale-y="0.8"
                    translation-x="0"
                    translation-y="-0.098" />
            </fw-scene-layer>
            <fw-scene-layer type="module">
                <fw-text
                    text-x-alignment="center"
                    text-y-alignment="center"
                    priority="big-title"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Muli-SemiBold.ttf"
                    font-size="20"
                    font-color="#ff000000"
                    frame-width="70%"
                    frame-height="5%"
                    translation-x="0"
                    translation-y="-0.30"
                    value="Seek Your Adventure"
                    z-value="1" />
                <fw-text
                    text-x-alignment="center"
                    text-y-alignment="center"
                    priority="small-title"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/SpaceMono-Regular.ttf"
                    font-size="16"
                    font-style="Regular"
                    font-color="#ff000000"
                    frame-width="70%"
                    frame-height="5%"
                    translation-x="0"
                    translation-y="-0.38"
                    value="Toward an inspiring journey"
                    z-value="1" />
                <fw-image>
                    <source src="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/img/story_3.png" />
                </fw-image>
            </fw-scene-layer>
        </fw-scene>
    </fw-creation>
    <fw-creation
        alias="Sage"
        id="filter-0001">
        <fw-scene>
            <fw-scene-layer type="raw">
                <fw-video
                    fx-intensity="1.0"
                    fx-name="Sage" />
                <fw-image
                    fx-intensity="1.0"
                    fx-name="Sage" />
            </fw-scene-layer>
        </fw-scene>
    </fw-creation>
    <fw-creation
        alias="Fashion-4"
        id="fashion-0004">
        <fw-scene temporal="intro">
            <fw-scene-layer type="module">
                <fw-text
                    duration="3000000"
                    text-x-alignment="left"
                    text-y-alignment="top"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/ShadowsIntoLightTwo-Regular.ttf"
                    font-size="80"
                    font-color="#ffffffff"
                    frame-width="70%"
                    frame-height="46.87%"
                    translation-x="0"
                    translation-y="0"
                    value="ALL ABOUT FASHION"
                    z-value="1" />
                <fw-image
                    duration="3000000">
                    <source
                        aspect-ratio="9:16"
                        src="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/img/white-frame.png" />
                </fw-image>
            </fw-scene-layer>
        </fw-scene>
    </fw-creation>
    <fw-creation
        alias="Fashion-9"
        id="fashion-0009">
        <fw-scene temporal="intro">
            <fw-scene-layer type="module">
                <fw-text
                    duration="3000000"
                    text-x-alignment="center"
                    text-y-alignment="center"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Avenir-Medium.ttf"
                    font-size="40"
                    font-color="#ff000000"
                    frame-width="40.13%"
                    frame-height="13.94%"
                    translation-x="-0.02"
                    translation-y="0"
                    value="TODAY IN PARADISE"
                    z-value="1" />
                <fw-image
                    duration="3000000">
                    <source
                        aspect-ratio="9:16"
                        src="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/img/rect_mid_white_66.png" />
                </fw-image>
            </fw-scene-layer>
        </fw-scene>
    </fw-creation>
    <fw-creation
        alias="Beauty-1"
        id="beauty-0001">
        <fw-scene temporal="intro">
            <fw-scene-layer type="module">
                <fw-text
                    text-x-alignment="center"
                    text-y-alignment="center"
                    caption-style-uuid="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/captionpackage/4F09E7EB-9C2A-4C60-995D-B27B4F68DBCA.1.captionstyle"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Avenir-Medium.ttf"
                    font-size="38"
                    font-color="#ffffffff"
                    translation-x="0"
                    translation-y="0"
                    value="BEAUTY"
                    z-value="1" />
            </fw-scene-layer>
        </fw-scene>
        <fw-scene temporal="out">
            <fw-scene-layer type="module">
                <fw-text
                    text-x-alignment="center"
                    text-y-alignment="center"
                    caption-style-uuid="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/captionpackage/4F09E7EB-9C2A-4C60-995D-B27B4F68DBCA.1.captionstyle"
                    font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Avenir-Medium.ttf"
                    font-size="38"
                    font-color="#ffffffff"
                    translation-x="0"
                    translation-y="0"
                    value="BEAUTY"
                    z-value="1" />
            </fw-scene-layer>
        </fw-scene>
    </fw-creation>
</modules>`
  );
}

export function writeProjectXml(path) {
  FS.writeFile(
    path || "p.xml",
    `<?xml version="1.0" encoding="utf-8"?>
  <dom>
      <fw-creation
          video-width="1080"
          video-height="1920"
          version="1"
          alias="Meme-2">
          <fw-scene>
              <fw-scene-layer type="raw">
                  <fw-video
                      duration="9561000"
                      trim-in="-1"
                      trim-out="-1"
                      scale-x="1.0"
                      scale-y="1.0"
                      translation-x="0"
                      translation-y="0.125">
                      <source
                          src="https://cdn1.fireworktv.com/medias/2021/2/24/1614200924-unafxvoi/watermarked/540/20210225050830.mp4"
                          width="540"
                          height="960"
                          aspect-ratio="9:16" />
                  </fw-video>
              </fw-scene-layer>
              <fw-scene-layer type="module">
                  <fw-text
                      z-value="1"
                      font-color="#ff000000"
                      translation-x="0"
                      translation-y="0.36"
                      font-size="40"
                      frame-width="70%"
                      frame-height="10%"
                      text-x-alignment="center"
                      value="An inspiring journey"
                      font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Modern_Abel-Regular.ttf" />
                  <fw-image>
                      <source src="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/img/meme2.png" />
                  </fw-image>
              </fw-scene-layer>
          </fw-scene>
          <fw-scene>
              <fw-scene-layer type="raw">
                  <fw-image
                      duration="3000000"
                      motion-on="true"
                      scale-x="1.0"
                      scale-y="1.0"
                      translation-x="0.0"
                      translation-y="0.125">
                      <source
                          src="https://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/transcoded/20210225051236-540-4.jpg"
                          width="1080"
                          height="1920"
                          aspect-ratio="9:16" />
                  </fw-image>
              </fw-scene-layer>
              <fw-scene-layer type="module">
                  <fw-text
                      z-value="1"
                      font-color="#ff000000"
                      translation-x="0"
                      translation-y="0.36"
                      font-size="40"
                      frame-width="70%"
                      frame-height="10%"
                      text-x-alignment="center"
                      value="An inspiring journey"
                      font="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/font/Modern_Abel-Regular.ttf" />
                  <fw-image>
                      <source src="http://cdn1-staging.fireworktv.com/medias/2021/2/24/1614201163-nwhrdcax/assets/img/meme2.png" />
                  </fw-image>
              </fw-scene-layer>
          </fw-scene>
      </fw-creation>
  </dom>`
  );
}
