/**
 * Mock data hooks for preview routes
 * These provide synthetic data for visual debugging without authentication
 */

export interface MockSession {
  id: string;
  user_id: string;
  session_token: string;
  device_type: string | null;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_current: boolean;
  is_authorized: boolean;
  last_active_at: string;
  created_at: string;
  coordinates: { x: number; y: number };
}

export interface MockSecurityEvent {
  id: string;
  event_type: string;
  event_message: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  created_at: string;
  metadata?: Record<string, unknown>;
}

export interface MockIntegration {
  id: string;
  name: string;
  provider: string;
  permissions: string[];
  riskLevel: 'low' | 'medium' | 'high';
  connected_at: string;
  last_sync_at: string | null;
  icon?: string;
}

// Convert lat/lng to map percentage coordinates for SVG viewBox 100x50
function geoToMapCoords(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 50;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(50, y)) };
}

// Mock sessions data - same as seed-test-sessions edge function
export function useMockUserSessions(): { 
  data: MockSession[]; 
  isLoading: boolean; 
  error: null;
} {
  const now = new Date().toISOString();
  const mockUserId = 'preview-user-id';

  const sessions: MockSession[] = [
    {
      id: 'preview-session-1',
      user_id: mockUserId,
      session_token: 'preview-token-1',
      device_type: 'desktop',
      device_name: 'MacBook Pro',
      browser: 'Chrome 120',
      os: 'macOS Sonoma',
      ip_address: '192.168.1.100',
      city: 'San Francisco',
      country: 'United States',
      country_code: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
      is_current: true,
      is_authorized: true,
      last_active_at: now,
      created_at: now,
      coordinates: geoToMapCoords(37.7749, -122.4194), // SF: x=16.0, y=14.5
    },
    {
      id: 'preview-session-2',
      user_id: mockUserId,
      session_token: 'preview-token-2',
      device_type: 'mobile',
      device_name: 'iPhone 15 Pro',
      browser: 'Safari Mobile',
      os: 'iOS 17',
      ip_address: '10.0.0.50',
      city: 'New York',
      country: 'United States',
      country_code: 'US',
      latitude: 40.7128,
      longitude: -74.0060,
      is_current: false,
      is_authorized: true,
      last_active_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      coordinates: geoToMapCoords(40.7128, -74.0060), // NYC: x=29.4, y=13.7
    },
    {
      id: 'preview-session-3',
      user_id: mockUserId,
      session_token: 'preview-token-3',
      device_type: 'desktop',
      device_name: 'Windows PC',
      browser: 'Firefox 121',
      os: 'Windows 11',
      ip_address: '185.107.56.73',
      city: 'London',
      country: 'United Kingdom',
      country_code: 'GB',
      latitude: 51.5074,
      longitude: -0.1278,
      is_current: false,
      is_authorized: true,
      last_active_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      coordinates: geoToMapCoords(51.5074, -0.1278), // London: x=49.9, y=10.7
    },
    {
      id: 'preview-session-4',
      user_id: mockUserId,
      session_token: 'preview-token-4',
      device_type: 'unknown',
      device_name: 'Unknown Device',
      browser: 'Unknown',
      os: 'Linux',
      ip_address: '91.234.45.67',
      city: 'Moscow',
      country: 'Russia',
      country_code: 'RU',
      latitude: 55.7558,
      longitude: 37.6173,
      is_current: false,
      is_authorized: false, // Suspicious session
      last_active_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      coordinates: geoToMapCoords(55.7558, 37.6173), // Moscow: x=60.4, y=9.5
    },
  ];

  return { data: sessions, isLoading: false, error: null };
}

// Mock security events
export function useMockSecurityEvents(): {
  data: MockSecurityEvent[];
  isLoading: boolean;
  newEventIds: string[];
} {
  const events: MockSecurityEvent[] = [
    {
      id: 'event-1',
      event_type: 'login_success',
      event_message: 'Successful login from San Francisco, US',
      severity: 'success',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-2',
      event_type: 'suspicious_login',
      event_message: 'Unusual login attempt from Moscow, Russia',
      severity: 'critical',
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-3',
      event_type: 'session_revoked',
      event_message: 'Session revoked for device in Tokyo',
      severity: 'warning',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-4',
      event_type: 'mfa_enabled',
      event_message: 'Two-factor authentication enabled',
      severity: 'success',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'event-5',
      event_type: 'password_changed',
      event_message: 'Password successfully updated',
      severity: 'info',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return { data: events, isLoading: false, newEventIds: ['event-1', 'event-2'] };
}

// Mock connected integrations
export function useMockConnectedIntegrations(): {
  data: MockIntegration[];
  isLoading: boolean;
} {
  const integrations: MockIntegration[] = [
    {
      id: 'int-1',
      name: 'Plaid',
      provider: 'plaid',
      permissions: ['read_transactions', 'view_balance', 'view_accounts'],
      riskLevel: 'low',
      connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'int-2',
      name: 'Mint Import',
      provider: 'mint',
      permissions: ['read_transactions', 'view_balance', 'modify_categories'],
      riskLevel: 'medium',
      connected_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'int-3',
      name: 'Crypto Wallet',
      provider: 'coinbase',
      permissions: ['read_portfolio', 'view_transactions', 'send_funds'],
      riskLevel: 'high',
      connected_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      last_sync_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return { data: integrations, isLoading: false };
}

// Mock security settings
export function useMockSecuritySettings() {
  return {
    mfa_enabled: true,
    biometric_enabled: false,
    email_verified: true,
    password_strength: 4,
  };
}
