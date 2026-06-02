import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Calendar } from '@components/calendar/calendar.component';
import { CompanyHero } from '@components/company-hero/company-hero.component';
import { Header } from '@shared/header/header.component';
import { Layout } from '@shared/layout/layout.component';
import { SelectTime } from './components/select-time.component';

@Component({
  selector: 'app-select-time-date',
  templateUrl: './select-time-date.component.html',
  imports: [Layout, Header, CompanyHero, Calendar, SelectTime],
})
export class SelectTimeDateComponent {
  companyId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const companyIdParam = this.route.snapshot.paramMap.get('id');
    this.companyId = companyIdParam;
  }
}
