const letterboxd = require("letterboxd");

module.exports = async () => {
  const items = letterboxd("thelobster", (error, items) => {
    if (error) {
      return console.log(error);
    }
  });

  return items;
};
