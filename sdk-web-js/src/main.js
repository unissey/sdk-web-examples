import { AcquisitionPreset } from "@unissey/sdk-web-js";
import "./video-recorder";

const VALID_PRESETS = [
    AcquisitionPreset.SELFIE_FAST, 
    AcquisitionPreset.DOC_VIDEO, 
    AcquisitionPreset.DOC_IMAGE, 
    AcquisitionPreset.SELFIE_SUBSTANTIAL
];

function main() {
    const videoRecorder = document.getElementById("video-recorder");

    const outputZone = document.getElementById("output-zone");

    videoRecorder.addEventListener("capture-done", (e) => {
        const { media, metadata, preset } = e.detail;

        console.log(metadata);
        console.log(media);

        // Media and metadata are used by Unissey API

        // In the example an element displays the media

        let outputElmt = null;

        switch(preset) {
            case AcquisitionPreset.SELFIE_FAST:
                outputElmt = document.createElement("div");
                outputElmt.innerHTML = `Mjpeg Player not implemented. This preset is not suited for human review`
                break;
            case AcquisitionPreset.DOC_IMAGE:
                outputElmt = createMediaOutputElmt(media, "img");
                break;
            default:
                outputElmt = createMediaOutputElmt(media, "video");
        }

        outputZone.replaceChildren(outputElmt);
    })

    const presetSelect = document.getElementById("preset-select");

    presetSelect.addEventListener("change", (e) => {
        const newPreset = e.target.value;

        if(VALID_PRESETS.includes(newPreset)) {
            videoRecorder.setAttribute("preset", newPreset)
        }
    });
}

/**
 * @param {String} kind "img" | "video"
 * @param {Blob} media
 */
function createMediaOutputElmt(media, kind) {
    const outputElmt = document.createElement(kind);
    outputElmt.setAttribute("src", URL.createObjectURL(media));
    outputElmt.setAttribute("class", "output-video");
    outputElmt.setAttribute("controls", "");
    outputElmt.setAttribute("playsinline", "");
  
    return outputElmt;
  }


main();
