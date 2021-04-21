const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

module.exports = (value) => {
  const dateObject = dayjs(value).utc();
  return dateObject.utc().format('MMMM, YYYY');
};
