import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AcquisitionPreset, Capture, Data, EN, RecorderReady, Reference, Selfie, SessionConfig } from '@unissey-web/sdk-angular';
import { AnalyzeService } from './app.service';

@Component({
  selector: 'app-capture-page',
  templateUrl: './capture-pages.component.html',
  styleUrls: ['./capture-pages.component.scss']
})
export class CapturePageComponent {
  readonly AcquisitionPreset = AcquisitionPreset;
  readonly strings = EN;
  readonly page = this.route.snapshot.data['page'] as 'video' | 'selfie' | 'reference' | 'full' | 'iad';
  readonly videoConfig: SessionConfig = {};

  iadPrepareUrl = '';
  iadApiKey = '';
  iadConfig?: SessionConfig;
  iadError?: string;
  loadingIad = false;

  constructor(private route: ActivatedRoute, private analyzeService: AnalyzeService) {}

  get title(): string {
    return {
      video: 'Video recorder',
      selfie: 'Selfie capture',
      reference: 'Reference capture',
      full: 'Full capture',
      iad: 'IAD video recorder',
    }[this.page];
  }

  logRecord(data: Capture): void {
    console.log('recordCompleted', data);
  }

  logSelfie(data: Selfie): void {
    console.log('selfie', data);
  }

  logReference(data: Reference): void {
    console.log('reference', data);
  }

  logData(data: Data): void {
    console.log('data', data);
  }

  logReady(data: RecorderReady): void {
    console.log('recorderReady', data);
  }

  async prepareIad(): Promise<void> {
    this.loadingIad = true;
    this.iadError = undefined;
    this.iadConfig = undefined;

    try {
      if (!this.iadPrepareUrl) {
        throw new Error('Provide the IAD prepare URL.');
      }

      const data = await this.analyzeService.performIadPrepare(this.iadPrepareUrl, this.iadApiKey);
      this.iadConfig = { iadConfig: { data } };
    } catch (error) {
      this.iadError = error instanceof Error ? error.message : String(error);
    } finally {
      this.loadingIad = false;
    }
  }
}
