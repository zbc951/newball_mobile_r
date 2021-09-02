//Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterPath } from '@app/app.config';
// import   Swiper  from 'swiper';
@Component({
  templateUrl: 'teach.component.html',
  styleUrls: ['teach.component.scss'],

})

export class TeachComponent implements OnInit, OnDestroy {


  RouterPath = RouterPath;
  constructor(
  ) { }
  /**讓球R 大小 OU */
  PlayType = 'FT'

  // 比分
  score = 1;

  ngOnInit() {

  }

  ngOnDestroy() {


  }
  switchPlayType(_n){
    this.PlayType= _n;
  }
  switchscore(_num){
    this.score = _num;
  }
}
