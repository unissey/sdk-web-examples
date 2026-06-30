import { ChangeDetectorRef, Component } from '@angular/core';
import { AcquisitionPreset, EN, SessionConfig, Capture } from "@unissey-web/sdk-angular";
import { AnalyzeService } from './app.service';
import axios from "axios";
import { appConfig } from './app.config';

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
  preset = AcquisitionPreset.SELFIE_MJPEG;
  config: SessionConfig | undefined = undefined;

  ngOnInit() {
    this.iadPrepare();
  }

  iadPrepare() {
    this.analyzeService.performIadPrepare().subscribe(data => {
      this.iadStr = data;
      this.config = {
        iadConfig: {
          data
        }
      }

      console.log(this.config.iadConfig);
      this.cdr.detectChanges();
    })
  }

  // Handle Selfie Data
  async onRecord(data: Capture) {
    if (data.error) {
      alert(data.error);
      return;
    }

    const payload = new FormData();
    const metadata = typeof data.metadata === "string" ? data.metadata : JSON.stringify(data.metadata);
    
    payload.append("processings", "liveness");
    payload.append("selfie-detection-criteria", "single");
    payload.append("selfie-metadata", metadata);
    payload.append("selfie", data.media);
    payload.append("gdpr-consent", "true");
    
    await axios.post("https://api.test.unissey.com/analyze/v3", payload, {
      headers: {
        Authorization: appConfig.apiKey,
      }
    })
    .then(response => alert(JSON.stringify(response.data)))
    .catch(err => alert(JSON.stringify(err)))
    
  }
}
