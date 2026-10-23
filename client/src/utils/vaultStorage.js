// Device-level local vault management and persistence

const STORAGE_KEY_ACTIVE_ID = 'prana_active_vault_id';
const STORAGE_KEY_USER_VAULTS = 'prana_user_vaults';
const STORAGE_KEY_DEVICE_IP = 'prana_device_ip';
const STORAGE_KEY_SHOW_DEMO = 'prana_show_demo';

/**
 * Get active vault ID for this device
 */
export function getStoredVaultId() {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Set active vault ID for this device
 */
export function setStoredVaultId(id) {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id.toUpperCase());
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (e) {}
}

/**
 * Get all vaults created on this device
 */
export function getUserVaults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_VAULTS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Check if the user has created at least one vault on this device
 */
export function hasUserCreatedVaults() {
  const vaults = getUserVaults();
  return vaults && vaults.length > 0;
}

/**
 * Get the currently active user vault object
 */
export function getActiveUserVault() {
  try {
    const vaults = getUserVaults();
    if (!vaults || vaults.length === 0) return null;
    const activeId = getStoredVaultId();
    if (activeId) {
      const match = vaults.find(v => v.id && v.id.toUpperCase() === activeId.toUpperCase());
      if (match) return match;
    }
    return vaults[0];
  } catch (e) {
    return null;
  }
}

/**
 * Save a newly created vault to this device
 */
export function saveUserVault(vault) {
  try {
    if (!vault || !vault.id) return [];
    const normalizedVault = {
      ...vault,
      id: vault.id.toUpperCase()
    };
    const existing = getUserVaults();
    const filtered = existing.filter(v => v.id !== normalizedVault.id);
    const updated = [normalizedVault, ...filtered];
    localStorage.setItem(STORAGE_KEY_USER_VAULTS, JSON.stringify(updated));
    setStoredVaultId(normalizedVault.id);
    return updated;
  } catch (e) {
    console.error('Error saving user vault to device storage:', e);
    return [];
  }
}

/**
 * Remove a user vault from device storage
 */
export function removeUserVault(vaultId) {
  try {
    const existing = getUserVaults();
    const updated = existing.filter(v => v.id !== vaultId);
    localStorage.setItem(STORAGE_KEY_USER_VAULTS, JSON.stringify(updated));
    if (getStoredVaultId() === vaultId) {
      setStoredVaultId(updated.length > 0 ? updated[0].id : null);
    }
    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Get cached device IP address
 */
export function getStoredDeviceIp() {
  try {
    return localStorage.getItem(STORAGE_KEY_DEVICE_IP) || 'Device Recognized';
  } catch (e) {
    return 'Device Recognized';
  }
}

/**
 * Fetch and remember device public/local IP
 */
export async function detectAndSaveDeviceIp() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY_DEVICE_IP);
    if (cached && cached !== 'Device Recognized') return cached;

    // Try fast IP resolution
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        localStorage.setItem(STORAGE_KEY_DEVICE_IP, data.ip);
        return data.ip;
      }
    }
  } catch (e) {
    // Offline or blocked network fallback
  }

  // Fallback to recognized device placeholder
  const fallback = localStorage.getItem(STORAGE_KEY_DEVICE_IP) || 'Active Local Device';
  try {
    localStorage.setItem(STORAGE_KEY_DEVICE_IP, fallback);
  } catch (e) {}
  return fallback;
}

/**
 * Demo profiles toggle state for power users / testers
 */
export function getShowDemoProfiles() {
  try {
    return localStorage.getItem(STORAGE_KEY_SHOW_DEMO) === 'true';
  } catch (e) {
    return false;
  }
}

export function setShowDemoProfiles(show) {
  try {
    localStorage.setItem(STORAGE_KEY_SHOW_DEMO, show ? 'true' : 'false');
  } catch (e) {}
}
