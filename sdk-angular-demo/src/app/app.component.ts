import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { AcquisitionPreset, FaceChecker, EN, SessionConfig, IadMode, IadConfig } from "@unissey-web/sdk-angular";
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
  iadStr: string | undefined = undefined;

  constructor(private analyzeService: AnalyzeService, private cdr: ChangeDetectorRef){}

  strings = EN.videoRecorder;
  config: SessionConfig | undefined = undefined;

  ngOnInit() {
    this.iadPrepare();
  }

  iadPrepare() {
    this.analyzeService.performIadPrepare().subscribe(data => {
      this.iadStr = data;
      this.config = {
        iadConfig: {
          mode: IadMode.PASSIVE,
          data: data
        }
      }

      console.log(this.config.iadConfig);
      this.cdr.detectChanges();
    })
  }

  // Handle Selfie Data
  async onRecord(data: { media: Blob; metadata: unknown }) {
    
    const payload = new FormData();
    
    payload.append("processings", "liveness");
    payload.append("selfie-detection-criteria", "single");
    payload.append("selfie-metadata", data.metadata as string);
    payload.append("selfie", data.media);
    payload.append("gdpr-consent", "true");
    
    await axios.post("https://api.test.unissey.com/analyze/v3", payload, {
      headers: {
        Authorization: environment.apiKey,
      }
    })
    .then(response => alert(JSON.stringify(response.data)))
    .catch(err => alert(JSON.stringify(err)))
    
  }
}
