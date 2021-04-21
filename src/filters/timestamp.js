const dayjs = require("dayjs");

module.exports = (value) => {
  const dateObject = dayjs(value);
  return dateObject.format("YYYYMMDDHHss");
};
