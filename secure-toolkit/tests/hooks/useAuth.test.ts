import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { useAuth } from '../../src/hooks/useAuth';

const createWrapper = (config = {}) => ({ children }: { children: ReactNode }) => (
  <AuthProvider config={{ sessionTimeout: 3600, ...config }}>
    {children}
  </AuthProvider>
);

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useAuth();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toContain('must be used within an AuthProvider');
  });

  it('should provide auth state and methods', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('register');
    expect(result.current).toHaveProperty('updateUser');
  });

  it('should start with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should handle login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.login({
        email: 'demo@example.com',
        password: 'demo123'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeTruthy();
    expect(result.current.user?.email).toBe('demo@example.com');
  });

  it('should handle logout', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // First login
    await act(async () => {
      await result.current.login();
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  it('should handle login errors', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      try {
        await result.current.login({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should handle user updates', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    // Login first
    await act(async () => {
      await result.current.login();
    });

    const originalName = result.current.user?.name;

    // Update user
    act(() => {
      result.current.updateUser({ name: 'Updated Name' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
    expect(result.current.user?.name).not.toBe(originalName);
  });

  it('should handle registration', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.register({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('newuser@example.com');
    expect(result.current.user?.name).toBe('New User');
  });

  it('should persist session in localStorage', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      await result.current.login();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'secure-toolkit-session',
      expect.any(String)
    );

    const savedSession = JSON.parse(
      (localStorage.setItem as jest.Mock).mock.calls[0][1]
    );
    expect(savedSession).toHaveProperty('user');
    expect(savedSession).toHaveProperty('expiresAt');
  });
});