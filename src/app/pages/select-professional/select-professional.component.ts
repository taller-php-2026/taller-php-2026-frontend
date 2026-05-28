import { Component } from '@angular/core';
import { CompanyHero } from '@components/company-hero/company-hero.component';
import { Header } from '@shared/header/header.component';
import { Layout } from '@shared/layout/layout.component';

@Component({
  selector: 'app-select-professional',
  templateUrl: './select-professional.component.html',
  imports: [Header, Layout],
})
export class SelectProfessional {}
