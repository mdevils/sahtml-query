/**
 * @typedef SAElement
 * @property {string} tagName
 * @property {Object<string,string>} attrs
 * @property {boolean} autoEnd
 */

var attributeMatchers = {
  '=': function(ruleValue, attrValue) {
    return ruleValue === attrValue;
  },
  '^=': function(ruleValue, attrValue) {
    return attrValue.substr(0, ruleValue.length) === ruleValue;
  },
  '$=': function(ruleValue, attrValue) {
    return attrValue.substr(-ruleValue.length) === ruleValue;
  },
  '*=': function(ruleValue, attrValue) {
    return attrValue.indexOf(ruleValue) !== -1;
  },
  '~=': function(ruleValue, attrValue) {
    return attrValue.split(/\s+/).indexOf(ruleValue) !== -1;
  },
  '|=': function(ruleValue, attrValue) {
    return (
      attrValue === ruleValue ||
      attrValue.substr(0, ruleValue.length + 1) === ruleValue + '-'
    );
  }
};

/**
 * @param {SAElement} tag
 * @param {Rule|ParentRule} rule
 */
function tagMatches(tag, rule) {
  if (rule.tagName && rule.tagName !== tag.tagName) {
    return false;
  }
  if (rule.attrs) {
    for (var i = 0; i < rule.attrs.length; i++) {
      var attr = rule.attrs[i];
      var attrMatcher = attributeMatchers[attr.operator];
      if (!attrMatcher) {
        throw new Error('Unknown operator "' + attr.operator + '".');
      }
      if (!attrMatcher(attr.value, tag.attrs[attr.name] || '')) {
        return false;
      }
    }
  }
  return true;
}

/**
 * @param {SAElement[]} tags
 * @param {number} tagsPointer
 * @param {ParentRule[]} rules
 * @param {number} rulesPointer
 * @return {boolean}
 */
function tagInStackMatches(tags, tagsPointer, rules, rulesPointer) {
  var rule = rules[rulesPointer];
  if (!rule) {
    return true;
  }
  var tag = tags[tagsPointer];
  if (!tag) {
    return false;
  }
  if (!tagMatches(tag, rule)) {
    return false;
  }
  rulesPointer--;
  tagsPointer--;
  if (rule.nestingOperator === '>') {
    return tagInStackMatches(
      tags,
      tagsPointer,
      rules,
      rulesPointer
    );
  } else {
    if (tagsPointer >= 0) {
      while (tagsPointer >= 0) {
        if (tagInStackMatches(tags, tagsPointer, rules, rulesPointer)) {
          return true;
        }
        tagsPointer--;
      }
      return false;
    } else {
      return rulesPointer < 0;
    }
  }
}

module.exports = {
  /**
   * @param {SAElement[]} tagsStack
   * @param {ParentRule[][]} rules
   * @returns {boolean}
   */
  matches: function selectorMatches(tagsStack, rules) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (tagInStackMatches(
        tagsStack,
        tagsStack.length - 1,
        rule,
        rule.length - 1
      )) {
        return true;
      }
    }
    return false;
  }
};
