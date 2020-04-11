var SAHtml = require('sahtml').SAHtml;
var SAContext = require('./sa-context');
var FragmentContext = require('./fragment-context');

/**
 * @param {string} html
 * @constructor
 * @augments {SAContext}
 */
function DocumentContext(html) {
  SAContext.call(this);
  /**
   * @var {SAHtml}
   * @private
   */
  this.parser = new SAHtml(html);
}

Object.assign(DocumentContext.prototype, SAContext.prototype);

/** @private */
DocumentContext.prototype.run = function() {
  var token;
  var stack = [];
  while ((token = this.parser.next()).type !== 'eof') {
    if (token.type === 'tagDef') {
      var tagName = token.name;
      var attrs = {};
      token = this.parser.next();
      var autoEnd = false;
      while (true) {
        if (token.type === 'eof' || token.type === 'tagDefAutoEnd') {
          autoEnd = true;
          break;
        }
        if (token.type === 'tagDefEnd') {
          break;
        }
        if (token.type === 'tagAttr') {
          attrs[token.name.toLowerCase()] = token.value;
        }
        token = this.parser.next();
      }
      var tag = {
        tagName: tagName,
        attrs: attrs,
        autoEnd: autoEnd
      };
      stack.push(tag);
      this.consume('tagOpen', tag, stack);
      if (autoEnd) {
        stack.pop();
        this.consume('tagClose', tagName, stack);
      }
    } else if (token.type === 'string') {
      this.consume('text', token.value, stack);
    } else if (token.type === 'tagClose') {
      let lastTag = stack[stack.length - 1];
      if (lastTag && lastTag.tagName === token.name) {
        stack.pop();
      }
      this.consume('tagClose', token.name, stack);
    }
  }
};

/** @private */
DocumentContext.prototype.createSubContext = function(stack) {
  return new FragmentContext(this, stack);
};

module.exports = DocumentContext;
