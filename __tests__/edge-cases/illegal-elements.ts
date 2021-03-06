import {parse} from '../../src';

describe('parse()', () => {
    describe('illegal-elements', () => {
        it('should omit rows for non-existing tables', () => {
            let result = '';
            parse(
                '<div><tr><td><span>Hello</span></td><td><span>World</span></td></div>',
                ({onElement}) => {
                    onElement('div > span', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(Hello)(World)');
        });
    });
});
