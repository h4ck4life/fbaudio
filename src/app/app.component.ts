import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class AppComponent implements AfterViewChecked {

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
    blankVideo: '',
    controls: ['rewind', 'progress', 'current-time', 'fast-forward', 'volume', 'mute']
  };

  audioSources = [
    {
      src: '',
      type: 'audio/mp3',
    }
  ];
  ngAfterViewChecked(): void {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = 'Are you sure you want to leave?';
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    });
  }

  played(event: Plyr.PlyrEvent): void {
    //console.log('played', event);
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
          if (audioUrl !== undefined) {
            if (this.plyr.player.playing) {
              this.addIntoPlaylist(fbUrlValue, audioUrl);
            } else {
              this.audioSources = [{
                src: audioUrl,
                type: 'audio/mp3'
              }];
              this.addIntoPlaylist(fbUrlValue, audioUrl);
            }
          } else {
            this.showErrorMsg('There is no audio found for this video.');
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
          //this.errorElement.nativeElement.style.display = 'none';
        }
      );
    } else {
      this.urlValue = '';
      this.showErrorMsg('Please use valid facebook video url.');
    }
  }

  playBtn(audioUrl: string, index: any): void {
    if (this.plyr.player.playing && audioUrl === this.audioSources[0].src) {
      this.plyr.player.pause();
      document.getElementById('btn-state-' + index).classList.remove('fa-pause');
      document.getElementById('btn-state-' + index).classList.add('fa-play');
      this.playlistFocus(index);
    } else if (this.plyr.player.paused && audioUrl === this.audioSources[0].src) {
      this.plyr.player.play();
      document.getElementById('btn-state-' + index).classList.remove('fa-play');
      document.getElementById('btn-state-' + index).classList.add('fa-pause');
      this.playlistFocus(index);
    } else {
      document.getElementById('btn-state-' + index).parentElement.classList.add('is-loading');
      this.plyr.player.stop();
      this.audioSources = [{
        src: audioUrl,
        type: 'audio/mp3'
      }];
      setTimeout(() => {
        this.plyr.player.play();
        this.resetPlayBtnIcon();
        document.getElementById('btn-state-' + index).parentElement.classList.remove('is-loading');
        document.getElementById('btn-state-' + index).classList.remove('fa-play');
        document.getElementById('btn-state-' + index).classList.add('fa-pause');
        this.playlistFocus(index);
      }, 1000);

    }
  }

  playlistFocus(index: any): void {
    const elements: Element[] = Array.from(document.getElementsByClassName('playlist'));
    elements.forEach((el: Element) => {
      el.classList.remove('playlist-active');
    });
    document.getElementById('playlist-' + index).classList.toggle('playlist-active');
  }

  private resetPlayBtnIcon(): void {
    document.querySelectorAll('.fa-pause').forEach((el) => {
      el.classList.remove('fa-pause');
      el.classList.add('fa-play');
    });
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
