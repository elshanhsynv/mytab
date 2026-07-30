export interface DebouncedFunction<T extends (...args: unknown[]) => void> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;

      if (lastArgs) {
        fn(...lastArgs);
        lastArgs = undefined;
      }
    }, ms);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }

    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = undefined;
    }
  };

  return debounced;
}