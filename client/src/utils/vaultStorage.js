// Device-level local vault management and persistence

const STORAGE_KEY_ACTIVE_ID = 'prana_active_vault_id';
const STORAGE_KEY_USER_VAULTS = 'prana_user_vaults';
const STORAGE_KEY_DEVICE_IP = 'prana_device_ip';
const STORAGE_KEY_SHOW_DEMO = 'prana_show_demo';

export const DEFAULT_ISHRATH_VAULT = {
  id: 'AV-7045X',
  owner_name: 'Ishrath Shaik',
  blood_group: 'O+ve',
  allergies: 'None reported',
  conditions: 'Throat Infection',
  medications: '',
  implants: '',
  hospital_name: 'CMC-VELLORE',
  hospital_address: 'Vellore, Tamil Nadu',
  home_address: 'Bazzar Street, kota, kota(nl), Nellore',
  emergency_instructions: 'Contact father Shaik Ammasavali (+91 9502501287) immediately. Blood group is O+ve.',
  emergency_contacts: [
    { name: 'Shaik Ammasavali', relationship: 'Father', phone: '9502501287' },
    { name: 'Shaik Ishrath', relationship: 'Mother', phone: '7032893804' }
  ]
};

export const PRIMARY_USER_VAULT = DEFAULT_ISHRATH_VAULT;

/**
 * Get active vault ID for this device
 */
export function getStoredVaultId() {
  try {
    const val = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (val && val !== 'AV-8842' && val !== 'AV-7721' && val !== 'AV-9017S') {
      return val.toUpperCase();
    }
    const vaults = getUserVaults();
    if (vaults && vaults.length > 0 && vaults[0].id) {
      return vaults[0].id.toUpperCase();
    }
    return 'AV-7045X';
  } catch (e) {
    return 'AV-7045X';
  }
}

/**
 * Set active vault ID for this device
 */
export function setStoredVaultId(id) {
  try {
    if (id && id !== 'AV-8842' && id !== 'AV-7721' && id !== 'AV-9017S') {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id.toUpperCase());
    } else {
      const vaults = getUserVaults();
      const fallbackId = (vaults && vaults.length > 0 && vaults[0].id) ? vaults[0].id : 'AV-7045X';
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, fallbackId);
    }
  } catch (e) {}
}

/**
 * Get all vaults created on this device
 */
export function getUserVaults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_VAULTS);
    let vaults = raw ? JSON.parse(raw) : [];
    // Clean any unwanted dummy seeds, but preserve real user vaults (like AV-7045X and AV-3288G)
    vaults = vaults.filter(v => v && v.id && v.id !== 'AV-9017S' && v.id !== 'AV-8842' && v.id !== 'AV-7721');
    if (!vaults || vaults.length === 0) {
      vaults = [DEFAULT_ISHRATH_VAULT];
      localStorage.setItem(STORAGE_KEY_USER_VAULTS, JSON.stringify(vaults));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, 'AV-7045X');
    }
    return vaults;
  } catch (e) {
    return [DEFAULT_ISHRATH_VAULT];
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
    const activeId = getStoredVaultId();
    if (activeId) {
      const match = vaults.find(v => v.id && v.id.toUpperCase() === activeId.toUpperCase());
      if (match) return match;
    }
    return (vaults && vaults.length > 0) ? vaults[0] : DEFAULT_ISHRATH_VAULT;
  } catch (e) {
    return DEFAULT_ISHRATH_VAULT;
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
