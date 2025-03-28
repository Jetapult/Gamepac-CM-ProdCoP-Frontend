export default (params) => {
  if (!Array.isArray(params)) return '';

  if (params.length < 3 || params.length > 4) return '';

  const parts = params.map(function (e) {
    let r = (+e).toString(16);
    r.length === 1 && (r = '0' + r);
    return r;
  }, []);

  return !~parts.indexOf('NaN') ? '#' + parts.join('') : '';
};
