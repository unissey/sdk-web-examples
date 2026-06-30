import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnalyzeService {
  /**
   * IAD requires prepare data created by your backend before the recorder starts.
   * This sample makes the IAD prepare call explicit: provide your prepare URL and
   * API key in the demo page. It does not upload captured media.
   */
  async performIadPrepare(url: string, apiKey: string): Promise<string> {
    const response = await fetch(url, {
      method: 'POST',
      headers: apiKey ? { Authorization: apiKey } : undefined,
    });

    if (!response.ok) {
      throw new Error(`IAD prepare failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }
}
