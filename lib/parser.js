var CssSelectorParser = require('css-selector-parser').CssSelectorParser;

/**
 * @typedef Selectors
 * @property {string} type
 * @property {RuleSet[]} selectors
 */

/**
 * @typedef RuleSet
 * @property {string} type
 * @property {Rule} rule
 */

/**
 * @typedef Rule
 * @property {string} type
 * @property {string} tagName
 * @property {string} id
 * @property {Attr[]} attrs
 * @property {string} nestingOperator
 * @property {Rule} rule
 */

/**
 * @typedef ParentRule
 * @property {string} tagName
 * @property {Attr[]} attrs
 * @property {string} nestingOperator
 */

/**
 * @typedef Attr
 * @property {string} name
 * @property {string} operator
 * @property {string} value
 */

var parser = new CssSelectorParser();
parser.registerNestingOperators('>');
parser.registerAttrEqualityMods('^', '$', '*', '~', '|');

/**
 * @param {Rule} rule
 * @param {ParentRule[]} result
 */
function flattenRule(rule, result) {
  var attrs = rule.attrs ? rule.attrs.map(function(attr) {
      return {
        name: attr.name.toLowerCase,
        value: attr.value,
        operator: attr.operator
      };
    }) : rule.attrs;
  if (rule.id) {
    attrs = (attrs || []).concat({name: 'id', operator: '=', value: rule.id});
  }
  var tagName = rule.tagName ? rule.tagName.toLowerCase() : rule.tagName;
  if (tagName === '*') {
    tagName = undefined;
  }
  result.push({
    tagName: tagName,
    attrs: attrs,
    nestingOperator: rule.nestingOperator
  });
  if (rule.rule) {
    flattenRule(rule.rule, result);
  }
}

/**
 * @param {Selectors} selector
 * @return {ParentRule[][]}
 */
function flattenSelector(selector) {
  if (selector.type === 'selectors') {
    return selector.selectors.map(function(ruleSet) {
      var result = [];
      flattenRule(ruleSet.rule, result);
      return result;
    });
  } else {
    var result = [];
    flattenRule(selector.rule, result);
    return [result];
  }
}

module.exports = {
  parseCssSelector: function(selector) {
    return flattenSelector(parser.parse(selector));
  }
};
