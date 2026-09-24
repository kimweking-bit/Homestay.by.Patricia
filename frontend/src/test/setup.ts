import "@testing-library/jest-dom";

// jsdom does not implement matchMedia; gallery rail respects reduced-motion.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

// jsdom: IntersectionObserver used by gallery rail deferred images
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: number[] = [];
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {
      // Immediately report intersecting so tests see rail images when allowed.
      this.cb(
        [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

if (typeof globalThis.requestIdleCallback === "undefined") {
  globalThis.requestIdleCallback = ((cb: IdleRequestCallback) => {
    const id = setTimeout(
      () => cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline),
      0,
    );
    return id as unknown as number;
  }) as typeof requestIdleCallback;
  globalThis.cancelIdleCallback = ((id: number) => {
    clearTimeout(id as unknown as NodeJS.Timeout);
  }) as typeof cancelIdleCallback;
}
