import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  imports: [NgClass],
})
export class Calendar {
  @Output() dateSelected = new EventEmitter<Date>();
  currentDate = new Date();
  days: (number | null)[] = [];
  today = new Date();
  selectedDay: number | null = null;

  monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  getCurrentMonthName(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  isPastDay(day: number): boolean {
    const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    this.today.setHours(0, 0, 0, 0);
    return date < this.today;
  }

  selectDay(day: number) {
    this.selectedDay = day;
    const selected = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    this.dateSelected.emit(selected);
  }

  getDayClasses(day: number | null): object {
    if (day === null) return {};
    const past = this.isPastDay(day);
    const selected = day === this.selectedDay;

    return {
      'rounded-full': true,
      'text-gray-500 cursor-not-allowed': past,
      'cursor-pointer hover:bg-primary hover:text-white': !past && !selected,
      'bg-primary text-white': selected,
    };
  }

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const filteredDays = isCurrentMonth ? allDays.filter((d) => d >= today.getDate()) : allDays;

    this.days = [...Array(firstDay).fill(null), ...filteredDays];
  }

  prevMonth() {
    const today = new Date();
    const isCurrentMonth =
      this.currentDate.getFullYear() === today.getFullYear() &&
      this.currentDate.getMonth() === today.getMonth();

    if (!isCurrentMonth) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
      this.generateCalendar();
    }
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }
}
