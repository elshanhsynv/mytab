import './styles/tailwind.css';

import { initDashboard } from './dashboard/startup';

const root = document.querySelector<HTMLElement>('#app');

if (root) {
  void initDashboard(root).catch((error: unknown) => {
    console.error('Failed to initialize dashboard.', error);
    root.textContent = 'Unable to load dashboard.';
  });
}
