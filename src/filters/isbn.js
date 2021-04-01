const Cache = require("@11ty/eleventy-cache-assets");
const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com';
const GOOGLE_BOOKS_API_BOOK = '/books/v1/volumes';

/**
 * Returns back some ISBN object based on ISBN
 *
 * @param {String} isbn The isbn
 * @returns {Object} An object containing book data
 */
module.exports = async function (isbn, callback) {
  isbn = isbn.toString();
  isbn = isbn.replace(/-/g,'');
  try {
    isbn.replace
    const isbnObject = await Cache(
      `https://api.bookish.tech/search?type=isbn&id=${isbn}`,
      {
        duration: "1d",
        type: "json",
      }
    );
    const googleBooks = await Cache(`
    ${GOOGLE_BOOKS_API_BASE + GOOGLE_BOOKS_API_BOOK}?q=isbn:${isbn}`,
    {duration: "1d", type:"json"});
    isbnObject.googleBooksInfo = googleBooks.items[0].volumeInfo;
    callback(null, isbnObject);
  } catch (ex) {
    console.error("Isbn error: ", ex);
    callback(null, isbn);
  }
};
