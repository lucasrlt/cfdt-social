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

export const is_valid_url = str => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
};
