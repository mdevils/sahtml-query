import {parse} from '../../src';

describe('parse()', () => {
    describe('illegal-elements', () => {
        it('should omit rows for non-existing tables', () => {
            var text = '';
            parse(
                '<div><tr><td><span>Hello</span></td><td><span>World</span></td></div>',
                (context) => {
                    context.onElement('div > span', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += `${v}`);
                        liContext.after(() => {
                            text += ')';
                        });
                    });
                }
            );
            expect(text).toEqual('(Hello)(World)');
        });
    });
});
