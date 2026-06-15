import { setElementDimensions } from "./utils";

import {
  UnisseySdk,
  AcquisitionPreset,
  AcquisitionEvent,
  StatusEvent,
  LogLevel,
} from "@unissey/sdk-web-js";

class VideoRecorder extends HTMLElement {
  static observedAttributes = ["preset"];

  constructor() {
    super();

    // Values are defined when the element is mounted on the document

    // HTML Elements
    this.canvasElmt = null;
    this.videoElmt = null;
    this.captureBtn = null;
    this.pauseBtn = null;
    this.stopBtn = null;

    // Session config
    this.recordSession = null;
    this.preset = null;
    this.config = null;

    this.mediaStream = null;
  }

  /**
   * Called each time the video recorder custom element is added to the document
   */
  connectedCallback() {
    const template = document.getElementById("video-recorder-template");
    this.appendChild(template.content.cloneNode(true));

    const defaultPreset = AcquisitionPreset.SELFIE_STD;

    // Get canvas and video element from the DOM
    this.canvasElmt = this.querySelector("#canvas");
    this.videoElmt = this.querySelector("#video");
    this.captureBtn = this.querySelector("#capture-btn");
    this.pauseBtn = this.querySelector("#pause-btn");
    this.stopBtn = this.querySelector("#stop-btn");
    this.recorderWrappper = this.querySelector("#recorder-wrapper");

    this.preset = defaultPreset;
    this.updateDocVideoButtons(defaultPreset);

    UnisseySdk.setLogLevel(LogLevel.INFO);

    // Session Status: NO_SESSION -> READY -> STARTING -> RUNNING -> ABORTING
    UnisseySdk.addListener(AcquisitionEvent.STATUS, (status) => {
      this.handleSessionStatusChange(status);
    });

    // Session errors: NO_FACE, FORBIDDEN_ACTION, MOVE, CAMERA_ERROR
    UnisseySdk.addListener(AcquisitionEvent.ISSUE, (issue) => {
      console.warn("Unissey session issue:", issue);
    });

    // Face information, to check if face is centered
    UnisseySdk.addListener(AcquisitionEvent.FACE_INFO, (type, value) => {});

    // Acquisition progress, usefull for displaying a progress bar
    UnisseySdk.addListener(AcquisitionEvent.PROGRESS, (progress) => {
      console.log("Progress : ", progress);
    });

    // Start Capture
    this.captureBtn.onclick = async () => {
      const { media, metadata } = await this.capture();

      // dispatch media and meta data with a custom event
      this.dispatchEvent(
        new CustomEvent("capture-done", {
          detail: { media, metadata, preset: this.preset },
        }),
      );

      this.enableCaptureBtn();
    };

    this.pauseBtn.onclick = async () => {
      if (this.pauseBtn.textContent === "Pause") {
        const pauseEvent = new CustomEvent("pauseRecording");
        this.recordSession.dispatchEvent(pauseEvent);
        this.pauseBtn.textContent = "Resume";
      } else {
        const resumeEvent = new CustomEvent("resumeRecording");
        this.recordSession.dispatchEvent(resumeEvent);
        this.pauseBtn.textContent = "Pause";
      }
    };

    this.stopBtn.onclick = async () => {
      const stopEvent = new CustomEvent("stopRecording");
      this.recordSession.dispatchEvent(stopEvent);
    };

    this.createSession();
  }

  async createSession() {
    const sessionConfig = {
      overlayConfig: {
        colors: {
          background: [33, 33, 33, 0.4], // background color of overlay
          innerBorder: [33, 33, 33, 0.6], // borders color of oval
          progressColor: [255, 255, 255, 1], // displayed during acquisition
        },
      },
    };

    const isDocVideo = this.preset === AcquisitionPreset.DOC_VIDEO;
    if (isDocVideo) {
      if (!sessionConfig.recordingConfig) sessionConfig.recordingConfig = {};
      sessionConfig.recordingConfig.length = {
        type: "duration",
        durationMs: 0, // This...
      };
    }

    this.recordSession = await UnisseySdk.createSession(
      this.recorderWrappper,
      this.preset,
      sessionConfig,
    );

    // Access the media stream reference for advanced usage
    this.mediaStream = this.videoElmt.srcObject;
  }

  async resetSession() {
    if (this.recordSession !== null) {
      // Release the previous session
      await this.recordSession.release();

      // Create a new session
      await this.createSession();
    }
  }

  /**
   *
   * @param {StatusEvent} status
   */
  handleSessionStatusChange(status) {
    switch (status) {
      case StatusEvent.READY:
        // adjust size of the video wrapper to fit container size
        this.adjsutContainerSize();
        this.enableCaptureBtn();
        this.disablControlBtn();
        break;

      case StatusEvent.NO_SESSION:
        this.recordSession = null;
        break;

      case StatusEvent.STARTING:
        this.disableCaptureBtn();
        this.enableControlBtn();
        break;
    }
  }

  disableCaptureBtn() {
    this.captureBtn.disabled = true;
  }

  enableCaptureBtn() {
    this.captureBtn.disabled = false;
  }

  disablControlBtn() {
    this.pauseBtn.disabled = true;
    this.stopBtn.disabled = true;
  }

  enableControlBtn() {
    this.pauseBtn.disabled = false;
    this.stopBtn.disabled = false;
  }

  /**
   * Adjust the size of elements to maintain video aspect ratio
   */
  adjsutContainerSize() {
    const container = this.querySelector("#recorder-wrapper");

    // Width of the HTML element that contains the recorder
    const boxWidth = container.offsetWidth;

    // Aspect ratio of the video
    const videoRatio = this.videoElmt.videoWidth / this.videoElmt.videoHeight;

    // Video height to maintain aspect ratio
    const videoHeight = boxWidth / videoRatio;

    setElementDimensions(container, boxWidth, videoHeight);
    setElementDimensions(this.canvasElmt, boxWidth, videoHeight);
    setElementDimensions(this.videoElmt, boxWidth, videoHeight);
  }

  /**
   * Called when observed attributes are changed, added, removed or replaced
   *
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "preset":
        if (newValue !== this.preset) {
          this.preset = newValue;
          this.updateDocVideoButtons(newValue);
          this.resetSession();
        }
        break;
    }
  }

  updateDocVideoButtons(preset) {
    if (!this.pauseBtn || !this.stopBtn) return;
    const isDocVideo = preset === AcquisitionPreset.DOC_VIDEO;
    this.pauseBtn.classList.toggle("hidden", !isDocVideo);
    this.stopBtn.classList.toggle("hidden", !isDocVideo);
  }

  /**
   * Start the capture and return data
   * @returns {{media: Blob, metadata: string}}
   */
  async capture() {
    const data = await this.recordSession.capture({
      faceCheckerOptions: { check: "disabled" }, // disable face detection on capture
    });

    return data;
  }
}

customElements.define("video-recorder", VideoRecorder);
