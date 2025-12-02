/**
 * Security Logger - Centralized security event logging for $ave+
 */

import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'login'
  | 'logout'
  | 'password_change'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'session_revoked'
  | 'lockdown_activated'
  | 'lockdown_deactivated'
  | 'device_authorized'
  | 'connection_severed'
  | 'suspicious_activity';

export type SecuritySeverity = 'info' | 'success' | 'warning' | 'critical';

interface LogSecurityEventParams {
  event_type: SecurityEventType;
  event_message: string;
  metadata?: Record<string, any>;
  severity?: SecuritySeverity;
}

/**
 * Log a security event to the audit log
 * Fire-and-forget - does not block caller
 */
export async function logSecurityEvent({
  event_type,
  event_message,
  metadata = {},
  severity = 'info',
}: LogSecurityEventParams): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.warn('[SecurityLogger] No session, skipping log');
      return;
    }

    const { error } = await supabase
      .from('security_audit_log')
      .insert({
        user_id: session.user.id,
        event_type,
        event_message,
        metadata,
        severity,
      });

    if (error) {
      console.error('[SecurityLogger] Failed to log event:', error);
    }
  } catch (err) {
    console.error('[SecurityLogger] Error logging security event:', err);
  }
}

/**
 * Log a login event with device info
 */
export function logLoginEvent(deviceInfo?: {
  browser?: string;
  os?: string;
  device?: string;
  location?: string;
}): void {
  const message = deviceInfo?.browser 
    ? `New login from ${deviceInfo.browser}${deviceInfo.location ? ` (${deviceInfo.location})` : ''}`
    : 'New login detected';

  logSecurityEvent({
    event_type: 'login',
    event_message: message,
    metadata: deviceInfo || {},
    severity: 'success',
  });
}

/**
 * Log a session revocation event
 */
export function logSessionRevoked(sessionInfo: {
  device_name?: string;
  location?: string;
}): void {
  const message = sessionInfo.device_name
    ? `Session revoked: ${sessionInfo.device_name}${sessionInfo.location ? ` (${sessionInfo.location})` : ''}`
    : 'Session revoked';

  logSecurityEvent({
    event_type: 'session_revoked',
    event_message: message,
    metadata: sessionInfo,
    severity: 'warning',
  });
}

/**
 * Log lockdown activation
 */
export function logLockdownActivated(reason?: string): void {
  logSecurityEvent({
    event_type: 'lockdown_activated',
    event_message: 'Emergency lockdown activated',
    metadata: { reason: reason || 'Manual activation' },
    severity: 'critical',
  });
}

/**
 * Log lockdown deactivation
 */
export function logLockdownDeactivated(): void {
  logSecurityEvent({
    event_type: 'lockdown_deactivated',
    event_message: 'Lockdown deactivated',
    metadata: {},
    severity: 'success',
  });
}

/**
 * Log connection severed
 */
export function logConnectionSevered(appName: string): void {
  logSecurityEvent({
    event_type: 'connection_severed',
    event_message: `Connection severed: ${appName}`,
    metadata: { app_name: appName },
    severity: 'warning',
  });
}
