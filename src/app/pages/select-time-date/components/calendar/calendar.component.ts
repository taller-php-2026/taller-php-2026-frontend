import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  imports: [NgClass],
})
export class Calendar {
  @Input() diasConDisponibilidad = new Set<string>();
  @Output() dateSelected = new EventEmitter<Date>();
  @Output() visibleMonthChanged = new EventEmitter<{ year: number; month: number }>();

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

  hasAvailability(day: number): boolean {
    return this.diasConDisponibilidad.has(this.formatDateKey(day));
  }

  getDayClasses(day: number | null): object {
    if (day === null) return {};
    const past = this.isPastDay(day);
    const selected = day === this.selectedDay;
    const available = this.hasAvailability(day);

    return {
      'rounded-full': true,
      'text-gray-500 cursor-not-allowed': past,
      'cursor-pointer hover:bg-primary hover:text-white': !past && !selected,
      'bg-blue-50 text-blue-700 ring-2 ring-blue-500 ring-offset-1': !past && available && !selected,
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
    this.visibleMonthChanged.emit({ year, month: month + 1 });
  }

  prevMonth() {
    const today = new Date();
    const isCurrentMonth =
      this.currentDate.getFullYear() === today.getFullYear() &&
      this.currentDate.getMonth() === today.getMonth();

    if (!isCurrentMonth) {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
      this.selectedDay = null;
      this.generateCalendar();
    }
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.selectedDay = null;
    this.generateCalendar();
  }

  private formatDateKey(day: number): string {
    const year = this.currentDate.getFullYear();
    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const dayText = String(day).padStart(2, '0');
    return `${year}-${month}-${dayText}`;
  }
}
