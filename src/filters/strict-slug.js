const slugify = require("slugify");

module.exports = function(str) {
  return slugify(str, {
	replacement: "-",
	lower: true,
	strict: true,
	remove: /[%20]/g,
  });
};
