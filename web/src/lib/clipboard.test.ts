import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyTextToClipboard } from './clipboard';

afterEach(() => vi.unstubAllGlobals());

describe('clipboard export', () => {
  it('uses the native Android bridge when available', async () => {
    const copyToClipboard = vi.fn(() => true);
    vi.stubGlobal('window', { AndroidApp: { copyToClipboard }, isSecureContext: false });
    vi.stubGlobal('navigator', {});
    expect(await copyTextToClipboard('snapshot')).toBe(true);
    expect(copyToClipboard).toHaveBeenCalledWith('snapshot');
  });

  it('falls back to the browser clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('window', { isSecureContext: true, AndroidApp: undefined });
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await copyTextToClipboard('snapshot')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('snapshot');
  });

  it('returns false when no clipboard method succeeds', async () => {
    const field = {
      value: '',
      style: {},
      setAttribute: vi.fn(),
      focus: vi.fn(),
      select: vi.fn(),
      setSelectionRange: vi.fn(),
      blur: vi.fn(),
      remove: vi.fn()
    };
    vi.stubGlobal('window', { isSecureContext: false, AndroidApp: undefined });
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('document', {
      createElement: vi.fn(() => field),
      body: { appendChild: vi.fn() },
      execCommand: vi.fn(() => false)
    });
    expect(await copyTextToClipboard('snapshot')).toBe(false);
  });
});
