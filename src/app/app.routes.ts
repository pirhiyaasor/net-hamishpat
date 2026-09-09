import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./desktop-scene/desktop-scene.component').then((m) => m.DesktopSceneComponent),
    title: 'פורטל שרביט · עוזר AI',
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat-window.component').then((m) => m.ChatWindowComponent),
    title: 'עוזר AI · פורטל שופטים',
  },
  { path: '**', redirectTo: '' },
];
