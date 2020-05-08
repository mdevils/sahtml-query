import {parse} from '../../src';

describe('parse()', () => {
    describe('no-content-elements', () => {
        it('should handle input', () => {
            var text = '';
            parse(
                '<div><input><span>Hello</span> World</div>',
                (context) => {
                    context.onElement('div > span', (liContext) => {
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
        it('should handle meta, link, base, isindex, basefont', () => {
            var text = '';
            parse(
                '<head><meta><link><base><isindex><basefont><title>Hello</title></head>',
                (context) => {
                    context.onElement('head > title', (liContext) => {
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
        it('should handle hr, br, area, img', () => {
            var text = '';
            parse(
                '<div><hr><span>Hello</span><br><area><img><span>World</span></div>',
                (context) => {
                    context.onElement('div > span', (liContext) => {
                        text += '(';
                        liContext.onText((v) => text += v);
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
