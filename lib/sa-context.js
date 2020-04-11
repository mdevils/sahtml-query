var selectorMatches = require('./tag-info').matches;
var parseCssSelector = require('./parser').parseCssSelector;

var lastId = 0;

function generateId() {
  return 'id' + (lastId++);
}


/**
 * @callback OnElementCallback
 * @param {FragmentContext} context
 * @param {SAElement} tag
 */

/**
 * @callback OnTextCallback
 * @param {string} text
 */

/**
 * @typedef Subscription
 * @property {Function} callback
 * @property {Object} context
 */

/**
 * @typedef SubContext
 * @property {ParentRule[]|null} selector
 * @property {Function} callback
 */

function SAContext() {
  /**
   * @var {Object<string,Subscription>}
   * @private
   */
  this.subscriptions = {};
  /**
   * @var {Object<string,SubContext>}
   * @private
   */
  this.subContexts = {};
  /**
   * @var {Function}
   * @private
   */
  this.afterCallback = null;
}

/** @protected */
SAContext.prototype.subscribe = function(callback, context) {
  var newId = generateId();
  var subscriptions = this.subscriptions;
  subscriptions[newId] = {
    callback: callback,
    context: context
  };
  return function() {
    delete subscriptions[newId];
  };
};

/** @protected */
SAContext.prototype.consume = function(type, data, stack) {
  // console.log('consume', type, data, this.constructor.name, this.subContexts);
  this.emit(type, data, stack);
  var subContextKeys = Object.keys(this.subContexts);
  var i = 0;
  var subContext;
  var subContextKey;
  if (type === 'tagOpen') {
    for (; i < subContextKeys.length; i++) {
      subContextKey = subContextKeys[i];
      subContext = this.subContexts[subContextKey];
      var selector = subContext.selector;
      if (selector && selectorMatches(stack, selector)) {
        subContext.callback(this.createSubContext(stack), data);
      }
    }
    return;
  }
  if (type === 'text') {
    for (; i < subContextKeys.length; i++) {
      subContextKey = subContextKeys[i];
      subContext = this.subContexts[subContextKey];
      if (!subContext.selector) {
        subContext.callback(data);
      }
    }
  }
};

/**
 * @param {OnTextCallback} callback
 * @return {SAContext}
 */
SAContext.prototype.onText = function(callback) {
  var newId = generateId();
  this.subContexts[newId] = {callback: callback};
  return this;
};

/**
 * @param {string} selector
 * @param {OnElementCallback} callback
 * @return {SAContext}
 */
SAContext.prototype.onElement = function(selector, callback) {
  var newId = generateId();
  this.subContexts[newId] = {
    callback: callback,
    selector: parseCssSelector(selector)
  };
  return this;
};

/** @protected */
SAContext.prototype.createSubContext = function() {
  return new SAContext();
};

/** @protected */
SAContext.prototype.emit = function(type, data, stack) {
  var subscriptions = this.subscriptions;
  var subscriptionIds = Object.keys(subscriptions);
  for (var i = 0; i < subscriptionIds.length; i++) {
    var subscription = this.subscriptions[subscriptionIds[i]];
    subscription.callback.call(subscription.context, type, data, stack);
  }
};

SAContext.prototype.after = function(callback) {
  /**
   * @var {Function}
   * @private
   */
  this.afterCallback = callback;
  return this;
};

/** @protected */
SAContext.prototype.destroy = function() {
  this.afterCallback && this.afterCallback();
};

module.exports = SAContext;
