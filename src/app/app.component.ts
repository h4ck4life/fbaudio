import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { FacebookService } from './facebook.service';

declare var $: any;

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

  @ViewChild("fbvidurl") fbVidUrlElement: ElementRef;
  @ViewChild("listentbtn") listentBtnElement: ElementRef;
  @ViewChild("listenTxt") listenTxtElement: ElementRef;

  plyOptions = {
    settings: [],
    autoplay: false
  }

  audioSources = [
    {
      src: '',
      type: 'audio/mp3',
    }
  ];

  played(event: Plyr.PlyrEvent) {
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
    const fbUrlValue = this.fbVidUrlElement.nativeElement.value;
    if (fbUrlValue && fbUrlValue != '') {
      this.disableBtnState(true);
      this.facebookService.getAudioLink(fbUrlValue).subscribe(
        (response) => {
          var el = $('<div></div>');
          el.html(response.body);
          const audioUrl = $('a:contains("Audio Only")', el).attr('href'); // All the anchor elements
          this.audioSources = [];
          this.audioSources.push({
            src: audioUrl,
            type: 'audio/mp3'
          });
        },
        (error) => {
          console.log('not ok');
          console.log(error)
        },
        () => {
          this.disableBtnState(false);
          this.fbVidUrlElement.nativeElement.value = "";
          this.plyr.player.pause();
          this.plyr.player.play();
        }
      )
    } else {
      this.fbVidUrlElement.nativeElement.classList.toggle("is-danger");
    }
  }

  private disableBtnState(disabled: boolean): void {
    this.fbVidUrlElement.nativeElement.disabled = disabled;
    this.listentBtnElement.nativeElement.disabled = disabled;
  }

}
