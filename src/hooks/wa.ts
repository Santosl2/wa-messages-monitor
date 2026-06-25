// Thin wrappers around WhatsApp Web's internal Metro modules, exposed via window.require
// once the bundle is loaded (Web 2.3000+).

declare global {
  interface Window {
    require: (name: string) => any;
    Debug?: { VERSION?: string };
  }
}

export const isReady = (): boolean =>
  typeof window.require === 'function' &&
  parseInt(window.Debug?.VERSION?.split('.')?.[1] ?? '0', 10) >= 3000;

export function waitTillReady(): Promise<void> {
  return new Promise((resolve) => {
    const tick = () => {
      if (isReady()) resolve();
      else setTimeout(tick, 200);
    };
    tick();
  });
}

// WhatsApp lazy-loads many modules only after the user authenticates and opens a chat.
// Wait until the modules our hooks depend on are reachable via window.require, or until
// timeoutMs elapses (so the rest of init still proceeds even if some module is renamed).
export function waitForModules(modules: string[], timeoutMs = 60_000): Promise<string[]> {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const tick = () => {
      const missing = modules.filter((m) => !tryRequire(m));
      if (missing.length === 0) return resolve([]);
      if (Date.now() - startedAt > timeoutMs) return resolve(missing);
      setTimeout(tick, 250);
    };
    tick();
  });
}

export function tryRequire<T = any>(name: string): T | null {
  try {
    return window.require(name) as T;
  } catch {
    return null;
  }
}

export function injectToFunction(
  target: { module: string; function: string },
  callback: (orig: (...args: any[]) => any, ...args: any[]) => any,
): boolean {
  const mod = tryRequire(target.module);
  if (!mod || typeof mod[target.function] !== 'function') return false;
  const orig = mod[target.function].bind(mod);
  mod[target.function] = (...args: any[]) => callback(orig, ...args);
  return true;
}

