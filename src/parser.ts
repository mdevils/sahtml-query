import {CssSelectorParser, Rule, RuleSet, Selector} from 'css-selector-parser';

type ParentRuleAttr = {name: string} & ({} | {operator: string, value: string | undefined, valueType?: string});

export type ParentRule = {
    tagName?: string;
    attrs?: ParentRuleAttr[];
    classNames?: string[];
    nestingOperator?: string | null;
};

const parser = new CssSelectorParser();
parser.registerNestingOperators('>');
parser.registerAttrEqualityMods('^', '$', '*', '~', '|');

function flattenRule(rule: Rule, result: ParentRule[]) {
    let attrs: ParentRuleAttr[] = rule.attrs ? rule.attrs.map((attr) => ({
        name: attr.name.toLowerCase(),
        ...attr
    })) : rule.attrs;
    if (rule.id) {
        attrs = (attrs || []).concat({name: 'id', operator: '=', value: rule.id, valueType: 'string'});
    }
    let tagName = rule.tagName ? rule.tagName.toLowerCase() : rule.tagName;
    if (tagName === '*') {
        tagName = undefined;
    }
    result.push({
        tagName: tagName,
        attrs: attrs,
        classNames: rule.classNames,
        nestingOperator: rule.nestingOperator
    });
    if (rule.rule) {
        flattenRule(rule.rule, result);
    }
}

export type FlatSelector = ParentRule[][];

function flattenSelector(selector: Selector): FlatSelector {
    if (selector.type === 'selectors') {
        return selector.selectors.map((ruleSet: RuleSet) => {
            const result: ParentRule[] = [];
            flattenRule(ruleSet.rule, result);
            return result;
        });
    } else {
        const result: ParentRule[] = [];
        flattenRule(selector.rule, result);
        return [result];
    }
}

export function parseCssSelector(selector: string): FlatSelector {
    return flattenSelector(parser.parse(selector));
}
