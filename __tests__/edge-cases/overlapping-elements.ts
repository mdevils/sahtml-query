import {parse} from '../../src';

describe('parse()', () => {
    describe('overlapping list items', () => {
        it('should handle overlapping list items', () => {
            let result = '';
            parse(
                '<ul><li>1<li>2<li>3</ul>',
                ({onElement}) => {
                    onElement('ul > li', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });

        it('should handle overlapping list items with OL', () => {
            let result = '';
            parse(
                '<ol><li>1<li>2<li>3</ol>',
                ({onElement}) => {
                    onElement('ol > li', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });

        it('should handle nested proper lists', () => {
            let result = '';
            parse(
                '<ul><li><ol><li>1</li><li>2</li><li>3</li></ol></li></ul>',
                ({onElement}) => {
                    onElement('ol > li', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });

        it('should handle nested improper lists', () => {
            let result = '';
            parse(
                '<ul><li><ol><li>1<li>2<li>3',
                ({onElement}) => {
                    onElement('ul > li > ol > li', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });
    });

    describe('overlapping table elements', () => {
        it('should handle overlapping table cells', () => {
            let result = '';
            parse(
                '<body><table><tr><td>1<td>2</table><table><tr><td>3',
                ({onElement}) => {
                    onElement('table > tbody > tr > td', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });
        it('should handle overlapping table rows', () => {
            let result = '';
            parse(
                '<body><table><tr><td>1<tr><td>2</table><table><tr><td>3',
                ({onElement}) => {
                    onElement('table > tbody > tr > td', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });
        it('should handle overlapping tbodies', () => {
            let result = '';
            parse(
                '<body><table><tbody class="c"><tr><td>1<tbody class="c"><tr><td>2</table>' +
                '<table><tbody class="c"><tr><td>3',
                ({onElement}) => {
                    onElement('table > tbody.c > tr > td', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });
        it('should handle overlapping t-elements', () => {
            let result = '';
            parse(
                '<body><table><thead class="c"><tr><td>1<tbody class="c"><tr><td>2<tfoot class="c"><tr><td>3</table>',
                ({onElement}) => {
                    onElement('table > .c > tr > td', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1)(2)(3)');
        });
    });
});
