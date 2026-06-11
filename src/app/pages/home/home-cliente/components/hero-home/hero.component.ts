import { Component, EventEmitter, Output } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgIconComponent, FormsModule],
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  searchTerm: string = '';

  @Output() onSearch = new EventEmitter<string>();

  search() {
    this.onSearch.emit(this.searchTerm);
  }
}
