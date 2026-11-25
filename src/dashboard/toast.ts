export type ToastAction = {
    label: string;
    onClick: () => void;
};

export type ToastOptions = {
    /** Adds a button to the toast, e.g. "Undo". */
    action?: ToastAction;
};

const DURATION_MS = 1800;
/** Toasts with a button stay longer so there is time to reach it. */
const ACTION_DURATION_MS = 6000;

let activeToast: HTMLDivElement | null = null;
let dismissTimer: number | undefined;

export function showToast(message: string, options: ToastOptions = {}): void {
    if (dismissTimer !== undefined) {
        window.clearTimeout(dismissTimer);
        dismissTimer = undefined;
    }

    if (activeToast) {
        activeToast.remove();
        activeToast = null;
    }

    const { action } = options;
    const toast = document.createElement('div');
    toast.dataset.toast = 'true';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    toast.className = [
        action
            ? 'pointer-events-auto flex items-center gap-3 py-1.5 pl-4 pr-1.5'
            : 'pointer-events-none px-4 py-2',
        'fixed bottom-6 left-1/2 z-[60]',
        '-translate-x-1/2',
        'rounded-full border border-white/15',
        'bg-white/10',
        'text-sm font-semibold text-white',
        'shadow-2xl shadow-black/30',
        'backdrop-blur-xl ring-1 ring-white/10',
        'will-change-[transform,opacity]',
        'transition-[transform,opacity]',
        'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    ].join(' ');

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches;

    const dismiss = (): void => {
        if (activeToast !== toast) return;

        if (dismissTimer !== undefined) {
            window.clearTimeout(dismissTimer);
            dismissTimer = undefined;
        }

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
    };

    if (action) {
        const text = document.createElement('span');
        text.textContent = message;

        const button = document.createElement('button');
        button.type = 'button';
        button.className =
            'rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70';
        button.textContent = action.label;
        button.addEventListener(
            'click',
            () => {
                dismiss();
                action.onClick();
            },
            { once: true },
        );

        toast.append(text, button);
    } else {
        toast.textContent = message;
    }

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

    dismissTimer = window.setTimeout(
        dismiss,
        action ? ACTION_DURATION_MS : DURATION_MS,
    );
}
