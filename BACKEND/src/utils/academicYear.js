export const getAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();

  return `${year}-${year + 1}`;
};