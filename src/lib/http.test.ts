import { describe, expect, it } from 'vitest';
import { assertSameOrigin } from './http';

describe('same-origin request guard', () => {
  it('accepts a request with its own origin', () => {
    const request = new Request('https://school.example/api/schools', {
      method: 'POST',
      headers: {
        origin: 'https://school.example',
        'sec-fetch-site': 'same-origin',
      },
    });

    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it.each([
    ['different host', 'https://attacker.example'],
    ['different scheme', 'http://school.example'],
    ['malformed origin', 'not-an-origin'],
  ])('blocks a %s origin', (_description, origin) => {
    const request = new Request('https://school.example/api/schools', {
      method: 'POST',
      headers: { origin },
    });

    expect(() => assertSameOrigin(request)).toThrow('Cross-site request blocked.');
  });

  it('respects the public origin behind a reverse proxy', () => {
    const request = new Request('http://next-internal/api/schools', {
      method: 'POST',
      headers: {
        host: 'school.example',
        origin: 'https://school.example',
        'x-forwarded-proto': 'https',
      },
    });

    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it('blocks an explicitly cross-site fetch', () => {
    const request = new Request('https://school.example/api/schools', {
      method: 'POST',
      headers: {
        origin: 'https://school.example',
        'sec-fetch-site': 'cross-site',
      },
    });

    expect(() => assertSameOrigin(request)).toThrow('Cross-site request blocked.');
  });
});
