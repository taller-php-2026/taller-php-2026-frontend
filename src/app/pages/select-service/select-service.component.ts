import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '@shared/header/header.component';
import { EmpresaHero } from './components/empresa-hero/empresa-hero.component';
import { LayoutComponent } from '@shared/layout/layout.component';
import { ServiceCards } from './components/service-cards/service-cards.component';

@Component({
  selector: 'app-select-service',
  templateUrl: './select-service.component.html',
  imports: [HeaderComponent, EmpresaHero, LayoutComponent, ServiceCards],
})
export class SelectService implements OnInit {
  empresaId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.empresaId = this.route.snapshot.paramMap.get('id');
  }
}
