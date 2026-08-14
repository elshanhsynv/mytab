export interface DebouncedFunction<
    T extends (...args: any[]) => any,
> {
    (...args: Parameters<T>): void;
    cancel(): void;
    flush(): void;
}

export function debounce<
    T extends (...args: any[]) => any,
>(
    fn: T,
    ms: number,
): DebouncedFunction<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    const debounced = (...args: Parameters<T>): void => {
        lastArgs = args;

        if (timer !== undefined) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = undefined;

            if (lastArgs !== undefined) {
                fn(...lastArgs);
                lastArgs = undefined;
            }
        }, ms);
    };

    debounced.cancel = (): void => {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }

        lastArgs = undefined;
    };

    debounced.flush = (): void => {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }

        if (lastArgs !== undefined) {
            fn(...lastArgs);
            lastArgs = undefined;
        }
    };

    return debounced;
}
