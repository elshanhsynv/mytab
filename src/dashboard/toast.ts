let activeToast: HTMLDivElement | null = null;
let dismissTimer: number | undefined;

export function showToast(message: string): void {
    if (dismissTimer !== undefined) {
        window.clearTimeout(dismissTimer);
        dismissTimer = undefined;
    }

    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    const toast = document.createElement('div');
    toast.dataset.toast = 'true';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    toast.className = [
        'pointer-events-none fixed bottom-6 left-1/2 z-[60]',
        '-translate-x-1/2',
        'rounded-full border border-white/15',
        'bg-white/10 px-4 py-2',
        'text-sm font-semibold text-white',
        'shadow-2xl shadow-black/30',
        'backdrop-blur-xl ring-1 ring-white/10',
        'will-change-[transform,opacity]',
        'transition-[transform,opacity]',
        'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    ].join(' ');

    toast.textContent = message;

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) {
        toast.style.opacity = '1';
    } else {
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 12px) scale(0.96)';
    }

    document.body.append(toast);
    activeToast = toast;

    if (!prefersReducedMotion) {
        requestAnimationFrame(() => {
            if (activeToast !== toast) return;

            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0) scale(1)';
        });
    }

    dismissTimer = window.setTimeout(() => {
        if (activeToast !== toast) return;

        if (prefersReducedMotion) {
            toast.remove();
            activeToast = null;
            return;
        }

        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 8px) scale(0.98)';

        const remove = () => {
            if (activeToast === toast) {
                toast.remove();
                activeToast = null;
            }
        };
        toast.addEventListener('transitionend', remove, { once: true });
        window.setTimeout(remove, 350);
    }, 1800);
}
