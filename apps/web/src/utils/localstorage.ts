export const setLocalStorage = (key: string, value: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
}

export const getLocalStorage = (key: string, fallback: any = null) => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(key) || fallback;
  }

  return fallback;
}

export const hasLocalStorage = (key: string) => 
  typeof localStorage !== 'undefined' && !!localStorage.getItem(key);

export const removeLocalStorage = (key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
}
