import { 
  Injectable, 
  PLATFORM_ID, 
  Inject, 
  Directive, 
  Input, 
  HostListener, 
  OnInit, 
  Component,
  NgModule 
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import {
  BehaviorSubject,
  Observable,
} from 'rxjs';
import InAppBrowserEscaper,
{
  InAppBrowserDetector,
  type BrowserInfo,
  type EscapeOptions,
} from './index';

/**
 * Angular Service for InAppBrowserEscaper
 */
@Injectable({
  providedIn: 'root'
})
export class InAppBrowserEscaperService {
  private browserInfoSubject = new BehaviorSubject<BrowserInfo | null>(null);
  private isInAppSubject = new BehaviorSubject<boolean>(false);

  public browserInfo$: Observable<BrowserInfo | null> = this.browserInfoSubject.asObservable();
  public isInApp$: Observable<boolean> = this.isInAppSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeDetection();
    }
  }

  private initializeDetection(): void {
    const info = InAppBrowserDetector.analyze();
    this.browserInfoSubject.next(info);
    this.isInAppSubject.next(info.isInApp);
  }

  /**
   * Get current browser information
   */
  public getBrowserInfo(): BrowserInfo | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return InAppBrowserDetector.analyze();
  }

  /**
   * Check if currently in in-app browser
   */
  public isInAppBrowser(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return InAppBrowserDetector.isInAppBrowser();
  }

  /**
   * Get the detected app name
   */
  public getAppName(): string | undefined {
    if (!isPlatformBrowser(this.platformId)) {
      return undefined;
    }
    return InAppBrowserDetector.getAppName();
  }

  /**
   * Attempt to escape from in-app browser
   */
  public escape(options?: EscapeOptions): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return InAppBrowserEscaper.escape(options);
  }

  /**
   * Copy URL to clipboard
   */
  public async copyUrlToClipboard(url?: string): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return await InAppBrowserEscaper.copyUrlToClipboard(url);
  }
}

/**
 * Angular Directive for InAppBrowserEscaper
 */
@Directive({
  selector: '[appInAppEscape]'
})
export class InAppBrowserEscapeDirective implements OnInit {
  @Input() escapeOptions?: EscapeOptions;
  @Input() autoEscape = false;

  constructor(private inAppBrowserService: InAppBrowserEscaperService) {}

  ngOnInit(): void {
    if (this.autoEscape && this.inAppBrowserService.isInAppBrowser()) {
      this.inAppBrowserService.escape(this.escapeOptions);
    }
  }

  @HostListener('click')
  onClick(): void {
    this.inAppBrowserService.escape(this.escapeOptions);
  }
}

/**
 * Angular Component for showing escape button
 */
@Component({
  selector: 'app-in-app-escape-button',
  template: `
    <button 
      *ngIf="showButton" 
      [class]="buttonClass" 
      [ngStyle]="buttonStyle"
      (click)="handleEscape()"
      [attr.aria-label]="ariaLabel">
      <ng-content>{{ buttonText }}</ng-content>
    </button>
  `
})
export class InAppBrowserEscapeButtonComponent implements OnInit {
  @Input() buttonText = 'Open in Browser';
  @Input() buttonClass = '';
  @Input() buttonStyle: { [key: string]: string } = {};
  @Input() escapeOptions?: EscapeOptions;
  @Input() ariaLabel = 'Open in external browser';

  public showButton = false;

  constructor(private inAppBrowserService: InAppBrowserEscaperService) {}

  ngOnInit(): void {
    this.showButton = this.inAppBrowserService.isInAppBrowser();
  }

  handleEscape(): void {
    this.inAppBrowserService.escape(this.escapeOptions);
  }
}

/**
 * Angular Module for InAppBrowserEscaper
 */
@NgModule({
  declarations: [
    InAppBrowserEscapeDirective,
    InAppBrowserEscapeButtonComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    InAppBrowserEscapeDirective,
    InAppBrowserEscapeButtonComponent
  ],
  providers: [
    InAppBrowserEscaperService
  ]
})
export class InAppBrowserEscaperModule { }
