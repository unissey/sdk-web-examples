import { setElementDimensions } from "./utils";

import {
  UnisseySdk,
  AcquisitionPreset,
  AcquisitionEvent,
  StatusEvent,
} from "@unissey/sdk-web-js";

UnisseySdk.hkdb = false;


class VideoRecorder extends HTMLElement {

  static observedAttributes = ["preset"]

  constructor() {
    super();

    // Values are defined when the element is mounted on the document
   
    // HTML Elements
    this.canvasElmt = null;
    this.videoElmt = null;
    this.captureBtn = null;

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

    const defaultPreset = AcquisitionPreset.SELFIE_SUBSTANTIAL;

    // Get canvas and video element from the DOM
    this.canvasElmt = this.querySelector("#canvas");
    this.videoElmt = this.querySelector("#video");
    this.captureBtn = this.querySelector("#capture-btn");

    this.preset = defaultPreset;  


    // Get a reference to sdk event emitter to track session lifecycle
    const sessionLifecycle = UnisseySdk.getReferenceToEventEmitter();

    // Session Status: NO_SESSION -> READY -> STARTING -> RUNNING -> ABORTING
    sessionLifecycle.on(AcquisitionEvent.STATUS, (status) => {
      this.handleSessionStatusChange(status);
    })
     
    // Session errors: NO_FACE, FORBIDDEN_ACTION, MOVE, CAMERA_ERROR
    sessionLifecycle.on(AcquisitionEvent.ISSUE, (status) => {
    })

    // Face information, to check if face is centered
    sessionLifecycle.on(AcquisitionEvent.FACE_INFO, (type, value) => {
    })

    // Acquisition progress, usefull for displaying a progress bar 
    sessionLifecycle.on(AcquisitionEvent.PROGRESS, (progress) => {
    })

    // Start Capture
    this.captureBtn.onclick = async () => {
      const { media, metadata } = await this.capture();

      // dispatch media and meta data with a custom event
      this.dispatchEvent(new CustomEvent("capture-done", {detail: {media, metadata, preset: this.preset}}));

      this.enableCaptureBtn()
    }

    this.createSession();
  }

  async createSession() {
    this.recordSession = await UnisseySdk.createSession(this.videoElmt, this.preset, this.canvasElmt, {
      overlayConfig: {
        colors: {
          background: [33, 33, 33, 0.4], // background color of overlay
          innerBorder: [33, 33, 33, 0.6], // borders color of oval
          progressColor: [255, 255, 255, 1], // displayed during acquisition
        },
      },
    });

    // Access the media stream reference for advanced usage
    this.mediaStream = this.videoElmt.srcObject;
  }

  async resetSession() {
    if(this.recordSession !== null) {
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
  handleSessionStatusChange(status){
    switch(status) {
      case StatusEvent.READY:
        // adjust size of the video wrapper to fit container size
        this.adjsutContainerSize()
        this.enableCaptureBtn();
        break;
      case StatusEvent.NO_SESSION:
        this.recordSession = null 
        break;
      case StatusEvent.STARTING:
        this.disableCaptureBtn()
        break;
    }
  }

  disableCaptureBtn() {
    this.captureBtn.disabled = true;
  }

  enableCaptureBtn() {
    this.captureBtn.disabled = false;
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
    switch(name) {
      case "preset":
        if(newValue !== this.preset) {
          this.preset = newValue;
          this.resetSession();
        }
        break;
    }
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
