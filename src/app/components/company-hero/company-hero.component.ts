import { Component, Input } from '@angular/core';
import { NgIconComponent } from '@ng-icons/core';

interface Company {
  id: string | null;
  name: string;
  rating: number;
  ubication: string;
  reviewCount: number;
}

@Component({
  selector: 'app-company-hero',
  imports: [NgIconComponent],
  templateUrl: './company-hero.component.html',
})
export class CompanyHero {
  @Input() companyId: string | null = null;
  company: Company | null = null;

  ngOnInit() {
    this.company = {
      id: this.companyId,
      name: 'Centro de Belleza y Estética',
      rating: 4.7,
      ubication: 'Montevideo, Uruguay',
      reviewCount: 328,
    };
  }
}
