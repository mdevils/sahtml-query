import {expect} from 'chai';
import {parse} from '../src';

describe('parse()', () => {
  it('should fetch simple elements', () => {
    var href = null;
    var text = '';
    parse(
      '<!doctype><html lang="en"><body>123<a id="hello" href="/">Hey</a>456</body></html>',
      (context) => {
        context.onElement('body a', (linkContext, element) => {
          href = element.attrs.href;
          linkContext.onText((v) => text += v);
        });
      }
    );
    expect(href).to.equal('/');
    expect(text).to.equal('Hey');
  });

  it('should support complicated selectors', () => {
    var href = null;
    var text = '';
    parse(
        '<!doctype><html lang="en"><body>123<a class="cls1 cls2 cls3" id="hello" href="/">Hey</a>456</body></html>',
        (context) => {
          context.onElement('body > a#hello.cls1.cls2', (linkContext, element) => {
            href = element.attrs.href;
            linkContext.onText((v) => text += v);
          });
          context.onElement('body > a#hello.cls4', (linkContext, element) => {
            linkContext.onText((v) => text += v);
          });
        }
    );
    expect(href).to.equal('/');
    expect(text).to.equal('Hey');
  });


  it('should fetch multiple elements', () => {
    var text = '';
    parse(
      '<!doctype><html lang="en"><body>(<i>Hello</i><span> </span></span><b>World</b>)</body></html>',
      (context) => {
        context.onElement('body > *', (subContext) => {
          subContext.onText((v) => text += v);
        });
      }
    );
    expect(text).to.equal('Hello World');
  });

  it('should collect nested text', () => {
    var text = '';
    parse(
      '<!doctype><html lang="en"><body>(<i>Hello</i><span> </span></span><b>World</b>)</body></html>',
      (context) => {
        context.onElement('body', (bodyContext) => {
          bodyContext.onText((v) => text += v);
        });
      }
    );
    expect(text).to.equal('(Hello World)');
  });

  it('should handle nested context', () => {
    var text = '';
    var attrs = '';
    parse(
      '<!doctype><html lang="en"><body><b><i accesskey="3">1</i></b><b><i accesskey="4">2</i></b></body></html>',
      (context) => {
        context.onElement('body', (bContext) => {
          bContext.onElement('i', (iContext, {attrs: {accesskey}}) => {
            attrs += accesskey;
            iContext.onText((v) => text += v);
          });
        });
      }
    );
    expect(text).to.equal('12');
    expect(attrs).to.equal('34');
  });
});
