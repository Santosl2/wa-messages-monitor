type MessageData = {
  contactName?: string;
  fullJid?: string;
  result: unknown;
};

type PageMessagePayload = {
  type: "message";
  data: Record<string, MessageData>;
};

const PAGE_BUNDLE_RELATIVE_URL = "__PAGE_BUNDLE_URL__";

function injectPageBundleIntoMainWorld() {
  if (import.meta.env.DEV) {
    return;
  }

  const src = chrome.runtime.getURL(PAGE_BUNDLE_RELATIVE_URL);
  if (document.querySelector(`script[data-wa-main-bundle=\"1\"][src=\"${src}\"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.type = "module";
  script.src = src;
  script.dataset.waMainBundle = "1";

  const parent = document.head ?? document.documentElement;
  if (!parent) return;

  parent.appendChild(script);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPageMessagePayload(value: unknown): value is PageMessagePayload {
  if (!isObject(value)) return false;
  if (value.type !== "message") return false;
  if (!isObject(value.data)) return false;
  return true;
}

injectPageBundleIntoMainWorld();

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  if (!isPageMessagePayload(event.data)) return;

  try {
    const stored = await chrome.storage.local.get("messages");
    const current = Array.isArray(stored.messages)
      ? (stored.messages as Record<string, MessageData>[])
      : [];


    await chrome.storage.local.set({
      messages: [
        event.data.data,
        ...current,
      ],
    });
  } catch (err) {
    console.warn("[storage-bridge] failed to persist message", err);
  }
});
