type MessageData = {
  contactName?: string;
  fullJid?: string;
  result: unknown;
};

type PageMessagePayload = {
  type: "message";
  data: Record<string, MessageData>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPageMessagePayload(value: unknown): value is PageMessagePayload {
  if (!isObject(value)) return false;
  if (value.type !== "message") return false;
  if (!isObject(value.data)) return false;
  return true;
}

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
