import {parse} from '../../src';

describe('parse()', () => {
    describe('unclosed-elements', () => {
        it('should handle unclosed elements on root level', () => {
            var text = '';
            parse(
                '<html><body>Hello',
                (context) => {
                    context.onElement('html > body', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += v);
                        liContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(Hello)');
        });
    });
});
