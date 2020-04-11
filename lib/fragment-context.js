var SAContext = require('./sa-context');

/**
 * @param {SAContext} parentContext
 * @param {SAElement[]} stack
 * @constructor
 * @augments {SAContext}
 */
function FragmentContext(parentContext, stack) {
  SAContext.apply(this);
  /**
   * @var {Function}
   * @private
   */
  this.ubsubscribe = parentContext.subscribe(this.consume, this);
  /**
   * @var {number}
   * @private
   */
  this.stackLength = stack.length;
}

Object.assign(FragmentContext.prototype, SAContext.prototype);

/** @protected */
FragmentContext.prototype.consume = function(type, data, stack) {
  SAContext.prototype.consume.call(this, type, data, stack);
  if (type === 'tagClose' && stack.length < this.stackLength) {
    this.ubsubscribe();
    this.destroy();
  }
};

/** @protected */
FragmentContext.prototype.createSubContext = function(stack) {
  return new FragmentContext(this, stack);
};

module.exports = FragmentContext;
