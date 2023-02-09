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

    // Create new instance of unissey sdk
    this.unisseySdk = new UnisseySDK();

    this.recordSession = null;

    // Setup session parameters
    this.config = {
      overlayConfig: {
        canvas,
        displayMode: OverlayDisplayMode.OVAL,
        colors: {
          background: [33, 33, 33, 0.4], // background color of overlay
          innerBorder: [33, 33, 33, 0.6], // borders color of oval
          progressColor: [255, 255, 255, 1], // displayed during acquisition
        },
      },
      cameraConfig: {
        //preferedResolution: VideoResolutionPreset.STD_480P, // 480p and 16/9 aspect ratio
        //preferedFps: 24,
        //facingMode: FacingMode.FRONT,
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
      AcquisitionPreset.FAST,
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

// create a recorder instance
const recorder = new VideoRecorder();

// get elements from Dom
const captureBtn = document.getElementById("capture-btn");
const outputLabel = document.getElementById("output-label");
const outputZone = document.getElementById("output-zone");
const resetBtn = document.getElementById("reset-btn");

/**
 * Handle click event on the capture button.
 * It performs the following actions:
 *  - capture video
 *  - create a video element and display it on output-zone
 *  - hide capture button
 *  - display reset button
 */
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

/**
 * Handle click event on reset button
 * - Create new record session
 * - hide reset button
 * - display capture button
 * - remove previous video recorded from DOM Tree
 */
resetBtn.addEventListener("click", async function () {
  await recorder.init();
  this.setAttribute("class", "hidden");
  captureBtn.setAttribute("class", "btn");

  outputZone.innerHTML = "";
  outputLabel.setAttribute("class", "output-label");
  outputZone.appendChild(outputLabel);
});
