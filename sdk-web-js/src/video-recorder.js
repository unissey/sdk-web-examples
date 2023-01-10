import UnisseySDK, {
  AcquisitionPreset,
  VideoResolutionPreset,
  FacingMode,
  OverlayDisplayMode,
} from "@unissey/sdk-web-js";

class VideoRecorder {
  constructor() {
    //get canvas and video element from the DOM
    const canvas = document.getElementById("canvas");
    this.videoElmt = document.getElementById("video");

    // Init Sdk
    this.unisseySdk = new UnisseySDK();

    this.recordSession = null;

    // Setup session parameters
    this.config = {
      overlayConfig: {
        canvas,
        displayMode: OverlayDisplayMode.OVAL,
        colors: {
          background: [33, 33, 33, 0.4],
          innerBorder: [33, 33, 33, 0.6],
          progressColor: [255, 255, 255, 1],
        },
      },
      cameraConfig: {
        preferedResolution: VideoResolutionPreset.STD_480P,
        preferedFps: 24,
        facingMode: FacingMode.FRONT,
      },
      recordingConfig: {
        audio: false,
        bitRateKbps: 1000,
        length: {
          type: "duration",
          durationMs: 4000,
        },
      },
    };

    this.init();
  }

  async init() {
    this.recordSession = await this.unisseySdk.createSession(
      this.videoElmt,
      AcquisitionPreset.SUBSTANTIAL,
      this.config
    );
  }

  async capture() {
    const { media: video } = await this.recordSession.capture({
      faceCheckerOptions: { check: "disabled" }, // disable face detection on capture
    });

    this.recordSession.release();

    return video;
  }
}

const recorder = new VideoRecorder();

const captureBtn = document.getElementById("capture-btn");
const outputLabel = document.getElementById("output-label");
const outputZone = document.getElementById("output-zone");
const resetBtn = document.getElementById("reset-btn");

captureBtn.addEventListener("click", async function () {
  const video = await recorder.capture();

  const videoOutputElmt = document.createElement("video");
  videoOutputElmt.setAttribute("src", URL.createObjectURL(video));
  videoOutputElmt.setAttribute("class", "output-video");
  videoOutputElmt.setAttribute("controls", "");
  videoOutputElmt.setAttribute("playsinline", "");

  outputLabel.setAttribute("class", "hidden");
  outputZone.appendChild(videoOutputElmt);

  this.setAttribute("class", "hidden");
  resetBtn.setAttribute("class", "btn");
});

resetBtn.addEventListener("click", async function () {
  await recorder.init();
  this.setAttribute("class", "hidden");
  captureBtn.setAttribute("class", "btn");

  outputZone.innerHTML = "";
  outputLabel.setAttribute("class", "output-label");
  outputZone.appendChild(outputLabel);
});
