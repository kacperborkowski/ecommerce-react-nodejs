import { hashPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('accepts the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct horse battery');

    expect(await verifyPassword('correct horse battery', hash)).toBe(true);
    expect(await verifyPassword('correct horse batterY', hash)).toBe(false);
  });

  it('never stores the password itself', async () => {
    const hash = await hashPassword('correct horse battery');

    expect(hash).toMatch(/^scrypt\$131072\$8\$1\$[^$]+\$[^$]+$/);
    expect(hash).not.toContain('correct horse battery');
  });

  it('gives the same password a different hash each time (random salt)', async () => {
    const first = await hashPassword('same password');
    const second = await hashPassword('same password');

    expect(first).not.toBe(second);
  });

  it('rejects a malformed stored hash', async () => {
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
  });
});
