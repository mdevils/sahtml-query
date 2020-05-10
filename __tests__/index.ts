import {parse} from '../src';

describe('parse()', () => {
  it('should fetch simple elements', () => {
    let href = null;
    let result = '';
    parse(
      '<!doctype><html lang="en"><body>123<a id="hello" href="/">Hey</a>456</body></html>',
      ({onElement}) => {
        onElement('body a', ({onText, element}) => {
          href = element.attrs.href;
          onText(({text}) => result += text);
        });
      }
    );
    expect(href).toEqual('/');
    expect(result).toEqual('Hey');
  });

  it('should support complicated selectors', () => {
    let resultHref = null;
    let resultText = '';
    parse(
        '<!doctype><html lang="en"><body>123<a class="cls1 cls2 cls3" id="hello" href="/">Hey</a>456</body></html>',
        ({onElement}) => {
          onElement('body > a#hello.cls1.cls2', ({onText, element: {attrs: {href}}}) => {
              resultHref = href;
            onText(({text}) => resultText += text);
          });
          onElement('body > a#hello.cls4', ({onText}) => {
            onText(({text}) => resultText += text);
          });
        }
    );
    expect(resultHref).toEqual('/');
    expect(resultText).toEqual('Hey');
  });


  it('should fetch multiple elements', () => {
    let result = '';
    parse(
      '<!doctype><html lang="en"><body>(<i>Hello</i><span> </span></span><b>World</b>)</body></html>',
      ({onElement}) => {
        onElement('body > *', ({onText}) => {
          onText(({text}) => result += text);
        });
      }
    );
    expect(result).toEqual('Hello World');
  });

  it('should collect nested text', () => {
    let result = '';
    parse(
      '<!doctype><html lang="en"><body>(<i>Hello</i><span> </span></span><b>World</b>)</body></html>',
      ({onElement}) => {
        onElement('body', ({onText}) => {
          onText(({text}) => result += text);
        });
      }
    );
    expect(result).toEqual('(Hello World)');
  });

  it('should handle nested context', () => {
    let resultText = '';
    let resultAttrs = '';
    parse(
      '<!doctype><html lang="en"><body><b><i accesskey="3">1</i></b><b><i accesskey="4">2</i></b></body></html>',
      (context) => {
        context.onElement('body', ({onElement}) => {
          onElement('i', ({onText, element: {attrs: {accesskey}}}) => {
            resultAttrs += accesskey;
            onText(({text}) => resultText += text);
          });
        });
      }
    );
    expect(resultText).toEqual('12');
    expect(resultAttrs).toEqual('34');
  });
});
