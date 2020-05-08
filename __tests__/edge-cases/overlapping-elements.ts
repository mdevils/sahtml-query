import {parse} from '../../src';

describe('parse()', () => {
    describe('overlapping list items', () => {
        it('should handle overlapping list items', () => {
            var text = '';
            parse(
                '<ul><li>1<li>2<li>3</ul>',
                (context) => {
                    context.onElement('ul > li', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += v);
                        liContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });

        it('should handle overlapping list items with OL', () => {
            var text = '';
            parse(
                '<ol><li>1<li>2<li>3</ol>',
                (context) => {
                    context.onElement('ol > li', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += v);
                        liContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });

        it('should handle nested proper lists', () => {
            var text = '';
            parse(
                '<ul><li><ol><li>1</li><li>2</li><li>3</li></ol></li></ul>',
                (context) => {
                    context.onElement('ol > li', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += v);
                        liContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });

        it('should handle nested improper lists', () => {
            var text = '';
            parse(
                '<ul><li><ol><li>1<li>2<li>3',
                (context) => {
                    context.onElement('ul > li > ol > li', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += v);
                        liContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });
    });

    describe('overlapping table elements', () => {
        it('should handle overlapping table cells', () => {
            var text = '';
            parse(
                '<body><table><tr><td>1<td>2</table><table><tr><td>3',
                (context) => {
                    context.onElement('table > tbody > tr > td', (tdContext) => {
                        text += '(';
                        tdContext.onText((v) => text += v);
                        tdContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });
        it('should handle overlapping table rows', () => {
            var text = '';
            parse(
                '<body><table><tr><td>1<tr><td>2</table><table><tr><td>3',
                (context) => {
                    context.onElement('table > tbody > tr > td', (tdContext) => {
                        text += '(';
                        tdContext.onText((v) => text += v);
                        tdContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });
        it('should handle overlapping tbodies', () => {
            var text = '';
            parse(
                '<body><table><tbody class="c"><tr><td>1<tbody class="c"><tr><td>2</table>' +
                '<table><tbody class="c"><tr><td>3',
                (context) => {
                    context.onElement('table > tbody.c > tr > td', (tdContext) => {
                        text += '(';
                        tdContext.onText((v) => text += v);
                        tdContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });
        it('should handle overlapping t-elements', () => {
            var text = '';
            parse(
                '<body><table><thead class="c"><tr><td>1<tbody class="c"><tr><td>2<tfoot class="c"><tr><td>3</table>',
                (context) => {
                    context.onElement('table > .c > tr > td', (tdContext) => {
                        text += '(';
                        tdContext.onText((v) => text += v);
                        tdContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(1)(2)(3)');
        });
    });
});
