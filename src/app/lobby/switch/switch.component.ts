import { Component, OnInit , Input ,Output ,EventEmitter} from '@angular/core';

@Component({
  selector: 'game-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent implements OnInit {

  @Input() data: any;

  @Output() callSwitch = new EventEmitter();

  constructor() { }

  ngOnInit() {
   
  }
  Switch(_name){
    
    // this.data[_name] = !this.data[_name];
    this.callSwitch.emit([_name, !this.data[_name]]);
  }
}
