import {FlatSelector, ParentRule} from './parser';

export interface SAElement {
    tagName: string;
    attrs: {[attrName: string]: string | undefined};
    classNames: string[];
    _classNameIndex: {[className: string]: true};
    autoEnd?: boolean;
}

const attributeMatchers: {[key: string]: (ruleValue: string, attrValue: string) => boolean} = {
    '=': function (ruleValue, attrValue) {
        return ruleValue === attrValue;
    },
    '^=': function (ruleValue, attrValue) {
        return attrValue.substr(0, ruleValue.length) === ruleValue;
    },
    '$=': function (ruleValue, attrValue) {
        return attrValue.substr(-ruleValue.length) === ruleValue;
    },
    '*=': function (ruleValue, attrValue) {
        return attrValue.indexOf(ruleValue) !== -1;
    },
    '~=': function (ruleValue, attrValue) {
        return attrValue.split(/\s+/).indexOf(ruleValue) !== -1;
    },
    '|=': function (ruleValue, attrValue) {
        return (
            attrValue === ruleValue ||
            attrValue.substr(0, ruleValue.length + 1) === ruleValue + '-'
        );
    }
};

function elementMatches(element: SAElement, rule: ParentRule): boolean {
    if (rule.tagName && rule.tagName !== element.tagName) {
        return false;
    }
    if (rule.classNames) {
        for (let className of rule.classNames) {
            if (!element._classNameIndex.hasOwnProperty(className)) {
                return false;
            }
        }
    }
    if (rule.attrs) {
        for (let attr of rule.attrs) {
            if ('operator' in attr) {
                const attrMatcher = attributeMatchers[attr.operator];
                if (!attrMatcher) {
                    throw new Error('Unknown operator "' + attr.operator + '".');
                }
                if (!attrMatcher(attr.value!, element.attrs[attr.name] || '')) {
                    return false;
                }
            } else if (!element.attrs.hasOwnProperty(attr.name)) {
                return false;
            }
        }
    }
    return true;
}

function elementInStackMatches(
    elements: SAElement[],
    elementsPointer: number,
    rules: ParentRule[],
    rulesPointer: number
): boolean {
    const rule = rules[rulesPointer];
    if (!rule) {
        return true;
    }
    const tag = elements[elementsPointer];
    if (!tag) {
        return false;
    }
    if (!elementMatches(tag, rule)) {
        return false;
    }
    rulesPointer--;
    elementsPointer--;
    if (rule.nestingOperator === '>') {
        return elementInStackMatches(
            elements,
            elementsPointer,
            rules,
            rulesPointer
        );
    } else {
        if (elementsPointer >= 0) {
            while (elementsPointer >= 0) {
                if (elementInStackMatches(elements, elementsPointer, rules, rulesPointer)) {
                    return true;
                }
                elementsPointer--;
            }
            return false;
        } else {
            return rulesPointer < 0;
        }
    }
}

export function selectorMatches(elementsStack: SAElement[], rules: FlatSelector) {
    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (elementInStackMatches(
            elementsStack,
            elementsStack.length - 1,
            rule,
            rule.length - 1
        )) {
            return true;
        }
    }
    return false;
}
