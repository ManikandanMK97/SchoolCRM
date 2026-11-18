// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';
import { PasswordChangeForm } from './password-change-form';
import { SchoolCreateForm } from './school-create-form';

const routerMocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMocks,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('EduSphere account forms', () => {
  it('routes a successful Platform Admin login to the dashboard', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { mustChangePassword: false } }),
    } as Response);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email address'), 'owner@edusphere.test');
    await user.type(screen.getByLabelText('Password'), 'PlatformPassword123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith('/dashboard');
    });
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@edusphere.test',
        password: 'PlatformPassword123!',
      }),
    });
  });

  it('routes a first-time School Admin to required password setup', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ user: { mustChangePassword: true } }),
    } as Response);
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText('Email address'), 'admin@school.test');
    await user.type(screen.getByLabelText('Password'), 'TemporaryPass123!');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(routerMocks.replace).toHaveBeenCalledWith('/change-password');
    });
  });

  it('rejects mismatched password confirmation before calling the API', async () => {
    const user = userEvent.setup();
    render(<PasswordChangeForm />);

    await user.type(
      screen.getByLabelText(/^New password/),
      'NewSchoolPassword123!',
    );
    await user.type(screen.getByLabelText('Confirm new password'), 'DifferentPassword123!');
    await user.click(screen.getByRole('button', { name: 'Set new password' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Those passwords do not match.'
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('shows the generated School Admin password once after school creation', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        school: { name: 'Northview Academy' },
        admin: { name: 'Avery Martin', email: 'avery@northview.test' },
        temporaryPassword: 'generated-one-time-password',
      }),
    } as Response);
    const user = userEvent.setup();
    render(<SchoolCreateForm />);

    await user.type(screen.getByLabelText('School name'), 'Northview Academy');
    await user.type(screen.getByLabelText('School email'), 'office@northview.test');
    await user.type(screen.getByLabelText('Phone'), '+1 202 555 0148');
    await user.type(screen.getByLabelText('Address'), '15 Cedar Avenue, Northview');
    await user.type(screen.getByLabelText('Full name'), 'Avery Martin');
    await user.type(screen.getByLabelText('Email address'), 'avery@northview.test');
    await user.click(screen.getByRole('button', { name: 'Create school and admin' }));

    expect(await screen.findByText('generated-one-time-password')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/platform/schools',
      expect.objectContaining({ method: 'POST' })
    );
    expect(routerMocks.refresh).toHaveBeenCalled();
  });
});
