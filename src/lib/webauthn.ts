import { supabase } from "@/integrations/supabase/client";

/**
 * Check if WebAuthn is supported by the browser
 */
export const isWebAuthnSupported = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
};

/**
 * Check if platform authenticator (Face ID/Touch ID) is available
 */
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) return false;
  
  try {
    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
};

/**
 * Convert base64url string to ArrayBuffer
 */
const base64urlToBuffer = (base64url: string): ArrayBuffer => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
};

/**
 * Convert ArrayBuffer to base64url string
 */
const bufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Register a new biometric credential
 */
export const registerBiometric = async (deviceName?: string): Promise<boolean> => {
  try {
    // Get registration options from backend
    const { data, error } = await supabase.functions.invoke('webauthn-register');
    
    if (error || !data) {
      throw new Error('Failed to get registration options');
    }

    // Convert challenge to ArrayBuffer
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      ...data,
      challenge: base64urlToBuffer(data.challenge),
      user: {
        ...data.user,
        id: base64urlToBuffer(data.user.id),
      },
    };

    // Create credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    const response = credential.response as AuthenticatorAttestationResponse;

    // Send credential to backend
    const { error: verifyError } = await supabase.functions.invoke('webauthn-verify', {
      body: {
        credential: {
          id: credential.id,
          rawId: bufferToBase64url(credential.rawId),
          response: {
            clientDataJSON: bufferToBase64url(response.clientDataJSON),
            attestationObject: bufferToBase64url(response.attestationObject),
            publicKey: response.getPublicKey() ? bufferToBase64url(response.getPublicKey()!) : null,
            transports: response.getTransports?.() || [],
          },
          type: credential.type,
        },
        deviceName,
      },
    });

    if (verifyError) {
      throw new Error('Failed to verify credential');
    }

    return true;
  } catch (error) {
    console.error('Biometric registration error:', error);
    throw error;
  }
};


/**
 * Check if user has registered biometric credentials
 */
export const hasRegisteredBiometric = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('webauthn_credentials')
      .select('id')
      .limit(1);
    
    return !error && data && data.length > 0;
  } catch {
    return false;
  }
};

/**
 * Get list of registered biometric devices
 */
export const getRegisteredDevices = async () => {
  const { data, error } = await supabase
    .from('webauthn_credentials')
    .select('id, device_name, created_at, last_used_at')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

/**
 * Remove a biometric credential
 */
export const removeBiometric = async (credentialId: string): Promise<void> => {
  const { error } = await supabase
    .from('webauthn_credentials')
    .delete()
    .eq('id', credentialId);
  
  if (error) throw error;
};