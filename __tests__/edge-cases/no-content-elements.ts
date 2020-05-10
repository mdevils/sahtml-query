import {parse} from '../../src';

describe('parse()', () => {
    describe('no-content-elements', () => {
        it('should handle input', () => {
            let result = '';
            parse(
                '<div><input><span>Hello</span> World</div>',
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
            expect(result).toEqual('(Hello)');
        });
        it('should handle meta, link, base, isindex, basefont', () => {
            let result = '';
            parse(
                '<head><meta><link><base><isindex><basefont><title>Hello</title></head>',
                ({onElement}) => {
                    onElement('head > title', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(Hello)');
        });
        it('should handle hr, br, area, img', () => {
            let result = '';
            parse(
                '<div><hr><span>Hello</span><br><area><img><span>World</span></div>',
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
