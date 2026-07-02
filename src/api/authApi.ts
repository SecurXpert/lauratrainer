const BASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  'https://lauratek.in:8000';

/* ======================
   HELPERS
   ====================== */

const getHeaders = (includeToken = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeToken) {
    const token = localStorage.getItem('access_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const safeJson = async (res: Response) => {
  try {
    return await res.json();
  } catch {
    const text = await res.text();
    return { message: text };
  }
};

/* ======================
   AUTH
   ====================== */

export async function login(payload: { email: string; password: string }) {
  try {
    const res = await fetch(`${BASE_URL}/trainer/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    return {
      success: res.ok,
      ...data,
    };
  } catch (err) {
    return { success: false, message: 'Network error' };
  }
}

/* ======================
   LOGIN MFA
   ====================== */

export async function verifyLoginMfa(payload: {
  temp_token: string;
  code: string;
}) {
  try {
    // Server expects 'temp_token' and 'code' in the body
    const res = await fetch(`${BASE_URL}/mfa/verify-login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ temp_token: payload.temp_token, code: payload.code }),
    });

    const data = await safeJson(res);

    return {
      success: res.ok,
      ...data,
    };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

/* ======================
   MFA ENROLL
   ====================== */

export async function enrollStart(payload: { token?: string } = {}) {
  try {
    const res = await fetch(`${BASE_URL}/mfa/enroll/start`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    return {
      success: res.ok,
      ...data,
    };
  } catch {
    return { success: false, message: 'Failed to start enrollment' };
  }
}

export async function enrollQr(tempToken: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/mfa/enroll/qr?token=${encodeURIComponent(tempToken)}`,
      { headers: { Accept: 'image/png' } }
    );

    if (!res.ok) throw new Error();

    const blob = await res.blob();
    return {
      success: true,
      qr_image: URL.createObjectURL(blob),
    };
  } catch {
    return { success: false, message: 'Failed to load QR code' };
  }
}

/* ======================
   RE-ENROLL USING BACKUP
   ====================== */

export async function reenrollStart(
  token: string,
  current_code: string
) {
  try {
    const res = await fetch(`${BASE_URL}/mfa/re-enroll/start`, {
      method: 'POST',
      headers: getHeaders(false),
      // Server expects 'token' and 'current_code'
      body: JSON.stringify({ token, current_code }),
    });

    if (!res.ok) {
      const err = await safeJson(res);
      // Surface 'MFA not enabled' so Login.tsx can redirect to fresh enroll
      return {
        success: false,
        error: err.detail || 'Invalid backup code',
        mfa_not_enabled: !!(err.detail && err.detail.toLowerCase().includes('not enabled')),
      };
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function reenrollQr(tempToken: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/mfa/re-enroll/qr?token=${encodeURIComponent(tempToken)}`,
      { headers: { Accept: 'image/png' } }
    );

    if (!res.ok) throw new Error();

    const blob = await res.blob();
    return {
      success: true,
      qr_image: URL.createObjectURL(blob),
    };
  } catch {
    return { success: false, message: 'Failed to load QR code' };
  }
}

/* ======================
   VERIFY ENROLL / RE-ENROLL
   ====================== */

export async function verifyMfaCode(
  token: string,
  code: string,
  isReenroll = false
) {
  const endpoint = isReenroll
    ? '/mfa/re-enroll/verify'
    : '/mfa/enroll/verify';

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({
        token,
        data: { code },
      }),
    });

    if (!res.ok) {
      const err = await safeJson(res);
      return { success: false, error: err.detail || 'Invalid code' };
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

/* ======================
   TRAINER PROFILE
   ====================== */

export async function getTrainerProfile() {
  try {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/trainer/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    const data = await safeJson(res);
    return {
      success: res.ok,
      status: res.status,
      ...data,
    };
  } catch (err) {
    return { success: false, error: 'Network error' };
  }
}
