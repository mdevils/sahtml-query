import {parse} from '../../src';

describe('parse()', () => {
    describe('textarea-content', () => {
        it('should handle unclosed elements on root level', () => {
            let result = '';
            parse(
                `<div><textarea>1 <b>2</b> 3 &lt;b&gt;4&lt;/b&gt;</textarea></div>`,
                ({onElement}) => {
                    onElement('div > textarea', ({onText, after}) => {
                        result += '(';
                        onText(({text}) => result += text);
                        after(() => {
                            result += ')';
                        });
                    });
                }
            );
            expect(result).toEqual('(1 <b>2</b> 3 <b>4</b>)');
        });
    });
});
