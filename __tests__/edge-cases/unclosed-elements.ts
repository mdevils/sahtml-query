import {parse} from '../../src';

describe('parse()', () => {
    describe('unclosed-elements', () => {
        it('should handle unclosed elements on root level', () => {
            let result = '';
            parse(
                '<html><body>Hello',
                (context) => {
                    context.onElement('html > body', (liContext) => {
                        result += '(';
                        liContext.onText(({text}) => result += text);
                        liContext.after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(Hello)');
        });
    });
});
