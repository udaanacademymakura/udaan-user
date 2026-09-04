import { lazy, type ComponentType } from "react";

const RELOAD_FLAG = "udaan:stale-chunk-reload";

const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk \S+ failed/i;

export function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return CHUNK_ERROR.test(message);
}

function alreadyReloaded() {
  try {
    return sessionStorage.getItem(RELOAD_FLAG) !== null;
  } catch {
    /* storage blocked in private mode */
    return false;
  }
}

export function clearStaleChunkFlag() {
  try {
    sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* storage blocked in private mode */
  }
}

export function reloadForStaleChunk() {
  // One reload per session: a second failure means the live build is broken, not stale,
  // and reloading again would trap the user in a loop.
  if (alreadyReloaded()) return false;
  try {
    sessionStorage.setItem(RELOAD_FLAG, Date.now().toString());
  } catch {
    /* storage blocked in private mode */
  }
  window.location.reload();
  return true;
}

export function lazyWithRetry<T extends ComponentType<any>>(loader: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const loaded = await loader();
      clearStaleChunkFlag();
      return loaded;
    } catch (error) {
      if (!isChunkLoadError(error)) throw error;

      await new Promise((resolve) => setTimeout(resolve, 400));

      try {
        const loaded = await loader();
        clearStaleChunkFlag();
        return loaded;
      } catch (retryError) {
        if (reloadForStaleChunk()) return new Promise<never>(() => { });
        throw retryError;
      }
    }
  });
}

export function installStaleChunkGuard() {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadForStaleChunk();
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (!isChunkLoadError(event.reason)) return;
    event.preventDefault();
    reloadForStaleChunk();
  });
}
