type AndroidClipboardBridge = { copyToClipboard?: (text: string) => boolean };

function androidBridge(): AndroidClipboardBridge | undefined {
  return (window as Window & { AndroidApp?: AndroidClipboardBridge }).AndroidApp;
}

/** Prefer the native Android clipboard in WebView, then browser APIs and a focused fallback. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    const bridge = androidBridge();
    if (bridge?.copyToClipboard?.(text)) return true;
  } catch {
    // A missing or restricted native bridge should not block browser fallbacks.
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Continue to the user-gesture-based fallback.
    }
  }

  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.setAttribute('aria-hidden', 'true');
    field.style.position = 'fixed';
    field.style.left = '0';
    field.style.top = '0';
    field.style.width = '1px';
    field.style.height = '1px';
    field.style.padding = '0';
    field.style.border = '0';
    field.style.opacity = '0.01';
    document.body.appendChild(field);
    field.focus();
    field.select();
    field.setSelectionRange(0, field.value.length);
    const copied = document.execCommand('copy');
    field.blur();
    field.remove();
    return copied;
  } catch {
    return false;
  }
}
