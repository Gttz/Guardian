import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CronogramPage } from './cronogram.page';

const routes: Routes = [
  {
    path: '',
    component: CronogramPage,
    children: [
        {
            path: 'skinstore',
            loadChildren: () => import('./skinstore/skinstore.module').then( m => m.SkinstorePageModule)
        }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CronogramPageRoutingModule {}
