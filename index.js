var DocumentContext = require('./lib/document-context');

/**
 * @callback ParseCallback
 * @param {DocumentContext} context
 */

module.exports = {
  /**
   * @param {string} html
   * @param {ParseCallback} callback
   */
  parse: function(html, callback) {
    var documentContext = new DocumentContext(html);
    callback(documentContext);
    documentContext.run();
  }
};
