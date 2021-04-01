module.exports = (slug) => {
  const regexpIssue = /[0-9]{4}-[0-9]{2}-[0-9]{2}(-| )([0-9]+)/;
  const match = slug.match(regexpIssue);
  return match[1];
};
