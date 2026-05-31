export function showToast(message: string): void {
  document.querySelector('[data-toast]')?.remove();

  const toast = document.createElement('div');
  toast.dataset.toast = 'true';
  toast.className =
    'fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-2xl shadow-black/30 backdrop-blur-xl ring-1 ring-white/10';
  toast.textContent = message;

  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1800);
}
