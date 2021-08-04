const pad_date_number = num => {
  let s = String(num);
  if (s.length < 2) return '0' + s;
  return s;
};

export const date_to_string = (date, nan) => {
  const parsed = new Date(nan ? date : Number(date));
  return `${pad_date_number(parsed.getDate())}/${pad_date_number(
    parsed.getMonth() + 1,
  )}/${String(parsed.getFullYear()).slice(2, 4)} à ${pad_date_number(
    parsed.getHours(),
  )}h${pad_date_number(parsed.getMinutes())}`;
};
