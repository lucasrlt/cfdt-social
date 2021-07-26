export const date_to_string = date => {
  const parsed = new Date(Number(date));
  return `${parsed.getDate()}/${parsed.getMonth() + 1}/${parsed.getFullYear()}`;
};
