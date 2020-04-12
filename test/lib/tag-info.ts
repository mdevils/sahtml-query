import {expect} from 'chai';
import {SAElement, selectorMatches as originalSelectorMatches} from '../../src/tag-info';
import {FlatSelector} from '../../src/parser';

function selectorMatches(stack: Partial<SAElement>[], selector: FlatSelector) {
    return originalSelectorMatches(stack.map(completeElement), selector);
}

function completeElement(incompleteElement: Partial<SAElement>): SAElement {
    return {
        tagName: 'div',
        attrs: {},
        classNames: [],
        _classNameIndex: (incompleteElement.classNames || []).reduce((res, className) => {
            res[className] = true;
            return res;
        }, {} as {[key: string]: true}),
        autoEnd: false,
        ...incompleteElement
    };
}

describe('tag-info', () => {
    describe('matches()', () => {
        it('should match one level cases', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'}
                    ]]
                )
            ).to.equal(true);
        });

        it('should match multi-selector', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'}
                    ],
                    [
                        [{tagName: 'div'}],
                        [{tagName: 'span'}]
                    ]
                )
            ).to.equal(true);
        });

        it('should match star', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'span'}
                    ],
                    [[{tagName: 'div'}, {tagName: 'span'}]]
                )
            ).to.equal(true);
        });

        it('should match a single class', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div', classNames: ['cls1']}
                    ],
                    [[{tagName: 'div', classNames: ['cls1']}]]
                )
            ).to.equal(true);
        });

        it('should match multiple classes', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div', classNames: ['cls1', 'cls2']}
                    ],
                    [[{tagName: 'div', classNames: ['cls1', 'cls2']}]]
                )
            ).to.equal(true);
        });

        it('should not match non-existent class', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div', classNames: ['cls1']}
                    ],
                    [[{tagName: 'div', classNames: ['cls2']}]]
                )
            ).to.equal(false);
        });

        it('should not match partially non-existent class', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div', classNames: ['cls1', 'cls2']}
                    ],
                    [[{tagName: 'div', classNames: ['cls1', 'cls3']}]]
                )
            ).to.equal(false);
        });

        it('should not match non-existing star', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'span'},
                        {tagName: 'div'}
                    ],
                    [[{tagName: 'div'}, {}]]
                )
            ).to.equal(false);
        });

        it('should match two level cases', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ]]
                )
            ).to.equal(true);
        });

        it('should match over a level', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'span'},
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ]]
                )
            ).to.equal(true);
        });

        it('should match over two levels', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'span'},
                        {tagName: 'div'},
                        {tagName: 'span'},
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ]]
                )
            ).to.equal(true);
        });

        it('should not match if parent wasn\'t found', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'span'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ]]
                )
            ).to.equal(false);
        });

        it('should match with direct parent', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div', nestingOperator: '>'}
                    ]]
                )
            ).to.equal(true);
        });

        it('should match with mixed nesting', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'span'},
                        {tagName: 'div'},
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div'},
                        {tagName: 'div', nestingOperator: '>'}
                    ]]
                )
            ).to.equal(true);
        });

        it('should not match with indirect parent', () => {
            expect(
                selectorMatches(
                    [
                        {tagName: 'div'},
                        {tagName: 'span'},
                        {tagName: 'div'}
                    ],
                    [[
                        {tagName: 'div'},
                        {tagName: 'div', nestingOperator: '>'}
                    ]]
                )
            ).to.equal(false);
        });

        describe('attributes', () => {
            describe('existance', () => {
                it('should match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {disabled: undefined}}],
                            [[{tagName: 'div', attrs: [{name: 'disabled'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: '/'}}],
                            [[{tagName: 'div', attrs: [{name: 'rel'}]}]]
                        )
                    ).to.equal(false);
                });
            });
            describe('=', () => {
                it('should match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: '/'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '=', value: '/'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: '/'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '=', value: '#'}]}]]
                        )
                    ).to.equal(false);
                });
            });

            describe('^=', () => {
                it('should match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '^=', value: 'ab'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '^=', value: 'bc'}]}]]
                        )
                    ).to.equal(false);
                });
            });

            describe('$=', () => {
                it('should match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '$=', value: 'bc'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '$=', value: 'ab'}]}]]
                        )
                    ).to.equal(false);
                });
            });

            describe('*=', () => {
                it('should match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '*=', value: 'b'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '*=', value: 'bb'}]}]]
                        )
                    ).to.equal(false);
                });
            });

            describe('~=', () => {
                it('should match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc def'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '~=', value: 'abc'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc def'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '~=', value: 'c d'}]}]]
                        )
                    ).to.equal(false);
                });
            });

            describe('|=', () => {
                it('should match on exact match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '|=', value: 'abc'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should match as prefix', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc-def'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '|=', value: 'abc'}]}]]
                        )
                    ).to.equal(true);
                });
                it('should not match', () => {
                    expect(
                        selectorMatches(
                            [{tagName: 'div', attrs: {href: 'abc def'}}],
                            [[{tagName: 'div', attrs: [{name: 'href', operator: '|=', value: 'abc'}]}]]
                        )
                    ).to.equal(false);
                });
            });
        });
    });
});
