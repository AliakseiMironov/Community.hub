export const getUserInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return "U"; // Если нет имени или фамилии, используем "U"
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};
