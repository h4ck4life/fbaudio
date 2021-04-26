import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { FacebookService } from './facebook.service';

declare var $: any;

interface PlayHistory {
  fbUrl: string;
  audioUrl: string;
  trackTitle?: string;
  trackDescription?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private facebookService: FacebookService
  ) { }

  title = 'Fb Audio';

  // get the component instance to have access to plyr instance
  @ViewChild(PlyrComponent, { static: true })
  plyr: PlyrComponent;

  @ViewChild('fbvidurl') fbVidUrlElement: ElementRef;
  @ViewChild('listentbtn') listentBtnElement: ElementRef;
  @ViewChild('listenTxt') listenTxtElement: ElementRef;
  @ViewChild('errorElement') errorElement: ElementRef;

  urlValue = '';
  errorMsg = '';
  isLoading = false;

  playHistoryList: PlayHistory[] = [

  ];

  plyOptions = {
    settings: [],
    autoplay: false,
    blankVideo: ''
  };

  audioSources = [
    {
      src: '',
      type: 'audio/mp3',
    }
  ];

  played(event: Plyr.PlyrEvent): void {
    console.log('played', event);
  }

  play(): void {
    this.plyr.player.play();
  }

  pause(): void {
    this.plyr.player.pause(); // or this.plyr.player.play()
  }

  stop(): void {
    this.plyr.player.stop(); // or this.plyr.player.stop()
  }

  listenBtn(): void {
    const fbUrlValue = this.urlValue;
    if (fbUrlValue && fbUrlValue !== '' && fbUrlValue.includes('https')) {
      this.disableBtnState(true);
      this.facebookService.getAudioLink(fbUrlValue).subscribe(
        (response) => {
          const el = $('<div></div>');
          el.html(response.body);
          const audioUrl = $('a:contains("Audio Only")', el).attr('href');
          if (this.plyr.player.playing) {
            this.addIntoPlaylist(fbUrlValue, audioUrl);
          } else {
            this.audioSources = [{
              src: audioUrl,
              type: 'audio/mp3'
            }];
            this.addIntoPlaylist(fbUrlValue, audioUrl);
          }
        },
        (error) => {
          console.log(error);
          this.disableBtnState(false);
          this.urlValue = '';
          this.showErrorMsg('Please use valid facebook video url.');
        },
        () => {
          this.disableBtnState(false);
          this.urlValue = '';
          this.errorElement.nativeElement.style.display = 'none';
        }
      )
    } else {
      this.urlValue = '';
      this.showErrorMsg('Please use valid facebook video url.');
    }
  }

  playBtn(audioUrl: string): void {
    this.plyr.player.stop();
    this.audioSources = [{
      src: audioUrl,
      type: 'audio/mp3'
    }];
    setTimeout(() => {
      this.plyr.player.play();
    }, 1000);
  }

  closeErrorElement(event): void {
    this.errorElement.nativeElement.style.display = 'none';
  }

  private addIntoPlaylist(fbUrlValue: string, audioUrl: string) {
    this.playHistoryList.push({
      fbUrl: fbUrlValue,
      audioUrl,
      trackTitle: `Track ${(this.playHistoryList.length + 1)}`,
      trackDescription: 'No description'
    });
  }

  private disableBtnState(disabled: boolean): void {
    this.fbVidUrlElement.nativeElement.disabled = disabled;
    this.isLoading = disabled;
  }

  private showErrorMsg(msg: string): void {
    this.errorMsg = msg;
    this.errorElement.nativeElement.style.display = 'block';
  }

}
