/**
 * Angular Integration Examples for InAppBrowserEscaper
 * 
 * This file contains example code for integrating InAppBrowserEscaper with Angular.
 * To use these examples, make sure you have Angular installed in your project.
 * 
 * ng add @angular/core @angular/common rxjs
 */

/*
// Example 1: Using the service
import { Component, OnInit } from '@angular/core';
import { InAppBrowserEscaperService } from '@jhrunning/inappbrowserescaper/angular';

@Component({
  selector: 'app-my-component',
  template: `
    <div *ngIf="isInApp">
      <p>You're browsing in {{ appName }}</p>
      <button (click)="escapeFromInApp()" class="escape-btn">
        Open in Browser
      </button>
      <button (click)="copyUrl()" class="copy-btn">
        Copy Link
      </button>
    </div>
    <div *ngIf="!isInApp">
      <p>You're in a regular browser!</p>
    </div>
  `
})
export class MyComponent implements OnInit {
  isInApp = false;
  appName?: string;

  constructor(private inAppBrowserService: InAppBrowserEscaperService) {}

  ngOnInit(): void {
    this.isInApp = this.inAppBrowserService.isInAppBrowser();
    this.appName = this.inAppBrowserService.getAppName();
  }

  escapeFromInApp(): void {
    this.inAppBrowserService.escape({
      message: 'For the best experience, please open this in your browser',
      buttonText: 'Open in Browser'
    });
  }

  async copyUrl(): Promise<void> {
    const success = await this.inAppBrowserService.copyUrlToClipboard();
    if (success) {
      alert('Link copied to clipboard!');
    }
  }
}

// Example 2: Using the directive
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <h1>My Website</h1>
      <button 
        appInAppEscape 
        [autoEscape]="true"
        [escapeOptions]="{
          message: 'Open this page in your default browser for the best experience'
        }"
        class="escape-btn">
        🌐 Open in Browser
      </button>
    </header>
  `
})
export class HeaderComponent {}

// Example 3: Using the escape button component
import { Component } from '@angular/core';

@Component({
  selector: 'app-content',
  template: `
    <div class="content">
      <app-in-app-escape-button
        buttonText="🌐 Open in Browser"
        buttonClass="my-escape-button"
        [buttonStyle]="{ 'background': '#007AFF', 'color': 'white' }"
        [escapeOptions]="{
          message: 'For the best experience, open this in your browser'
        }"
        ariaLabel="Open in external browser">
      </app-in-app-escape-button>
      
      <p>Your content here...</p>
    </div>
  `
})
export class ContentComponent {}

// Example 4: Module setup
import { NgModule } from '@angular/core';
import { InAppBrowserEscaperModule } from '@jhrunning/inappbrowserescaper/angular';

@NgModule({
  imports: [
    InAppBrowserEscaperModule
  ],
  declarations: [
    MyComponent,
    HeaderComponent,
    ContentComponent
  ]
})
export class AppModule {}

// Example 5: Using observables
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-observable-example',
  template: `
    <div>
      <p *ngIf="browserInfo">
        Platform: {{ browserInfo.platform }}
        <span *ngIf="browserInfo.isInApp">
          - In {{ browserInfo.appName }} app
        </span>
      </p>
    </div>
  `
})
export class ObservableExampleComponent implements OnInit, OnDestroy {
  browserInfo: any = null;
  private destroy$ = new Subject<void>();

  constructor(private inAppBrowserService: InAppBrowserEscaperService) {}

  ngOnInit(): void {
    this.inAppBrowserService.browserInfo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(info => {
        this.browserInfo = info;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
*/

// Note: Uncomment the examples above to use them in your Angular project
