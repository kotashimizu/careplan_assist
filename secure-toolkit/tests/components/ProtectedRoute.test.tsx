import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../src/providers/AuthProvider';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { authService } from '../../src/services/authService';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider config={{ sessionTimeout: 3600 }}>
    {children}
  </AuthProvider>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Clear any saved sessions
    localStorage.clear();
  });

  it('should show loading state initially', () => {
    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should redirect unauthenticated users', async () => {
    const mockLocation = { href: '/', pathname: '/' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    render(
      <TestWrapper>
        <ProtectedRoute redirectTo="/login">
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    // Wait for auth check to complete
    await screen.findByRole('status', {}, { timeout: 100 }).catch(() => null);

    expect(mockLocation.href).toBe('/login');
  });

  it('should show fallback for unauthenticated users', async () => {
    render(
      <TestWrapper>
        <ProtectedRoute fallback={<div>Please login</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    // Wait for loading to finish
    await screen.findByText('Please login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show content for authenticated users', async () => {
    // Mock authenticated session
    const session = {
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        permissions: ['read'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      expiresAt: Date.now() + 3600000
    };
    localStorage.setItem('secure-toolkit-session', JSON.stringify(session));

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    await screen.findByText('Protected Content');
    expect(screen.queryByText('Please login')).not.toBeInTheDocument();
  });

  it('should check role requirements', async () => {
    // Mock authenticated session with user role
    const session = {
      user: {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'user',
        permissions: ['read'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      expiresAt: Date.now() + 3600000
    };
    localStorage.setItem('secure-toolkit-session', JSON.stringify(session));

    render(
      <TestWrapper>
        <ProtectedRoute role="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    await screen.findByText('アクセス拒否');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should allow access with correct role', async () => {
    // Mock authenticated session with admin role
    const session = {
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['*'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      expiresAt: Date.now() + 3600000
    };
    localStorage.setItem('secure-toolkit-session', JSON.stringify(session));

    render(
      <TestWrapper>
        <ProtectedRoute role="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    await screen.findByText('Admin Content');
  });

  it('should allow access with multiple allowed roles', async () => {
    // Mock authenticated session with moderator role
    const session = {
      user: {
        id: '1',
        email: 'mod@example.com',
        name: 'Moderator User',
        role: 'moderator',
        permissions: ['moderate'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      expiresAt: Date.now() + 3600000
    };
    localStorage.setItem('secure-toolkit-session', JSON.stringify(session));

    render(
      <TestWrapper>
        <ProtectedRoute role={['admin', 'moderator']}>
          <div>Admin or Moderator Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    await screen.findByText('Admin or Moderator Content');
  });
});