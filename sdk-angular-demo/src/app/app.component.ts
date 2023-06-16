import { Component } from '@angular/core';
import { AcquisitionPreset, FaceChecker, EN } from "@unissey/sdk-angular";
import { AnalyzeService } from './app.service';
import axios from "axios";
import { environment } from 'src/environment';
import { response } from 'express';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AnalyzeService]
})
export class AppComponent {
  title = 'sdk-angular-demo';

  constructor(private analyzeService: AnalyzeService){}

  strings = EN.videoRecorder;

  config = {
    overlayConfig: {
      colors: {
        progressColor: [0, 0, 0, 1]
      }
    }
  }

  recorderOptions = {
    config: {
      recordingConfig: {
        audio: true,
        bitRateKbps: 2000,
        length: {
          type: "duration",
          durationMs: 2000,
        },
      },
    },
    preset: AcquisitionPreset.SELFIE_SUBSTANTIAL,
    faceChecker: "enabled" as FaceChecker,
    instructionMessages: [
      {
        message: "Instruction 1",
        duration: 5000,
      },
      {
        message: "Instruction 2",
        duration: 5000,
      },
      {
        message: "Instruction 3",
        duration: 5000
      }
    ]
  };

  // Handle Selfie Data
  async onSelfie(e: { media: Blob; metadata: unknown }) {
    
    const payload = new FormData();
    
    payload.append("processings", "liveness");
    payload.append("selfie-detection-criteria", "single");
    payload.append("metadata", e.metadata as string);
    payload.append("selfie", e.media);
    
    await axios.post(environment.apiAnalyzeUrl, payload, {
      headers: {
        Authorization: environment.apiKey
      }
    })
    .then(response => alert(JSON.stringify(response.data)))
    .catch(err => alert(JSON.stringify(err)))
    
  }
}
