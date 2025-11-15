// Vérifie si l'email a un format valide
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Vérifie si le mot de passe est fort
export function isValidPassword(password) {
  // Minimum 8 caractères, 1 majuscule et 1 chiffre
  const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}
