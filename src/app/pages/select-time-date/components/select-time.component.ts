import { Component } from '@angular/core';

@Component({
  selector: 'app-select-time',
  templateUrl: './select-time.component.html',
  standalone: true,
})
export class SelectTime {
  schedules = [
    { id: 1, time: '09:00 AM' },
    { id: 2, time: '10:00 AM' },
    { id: 3, time: '11:00 AM' },
    { id: 4, time: '12:00 PM' },
    { id: 5, time: '01:00 PM' },
    { id: 6, time: '02:00 PM' },
    { id: 7, time: '03:00 PM' },
    { id: 8, time: '04:00 PM' },
    { id: 9, time: '05:00 PM' },
  ];
}
