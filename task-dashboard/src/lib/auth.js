// Salva token nel localStorage
export const saveToken = (token) => localStorage.setItem("token", token);

// Recupera token dal localStorage
export const getToken = () => localStorage.getItem("token");

// Rimuove token dal localStorage (logout)
export const removeToken = () => localStorage.removeItem("token");

// Controlla se token esiste
export const isLoggedIn = () => !!getToken();
