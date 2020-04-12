# sahtml-query [![GitHub Actions Status](https://github.com/mdevils/sahtml-query/workflows/test/badge.svg?branch=master)](https://github.com/mdevils/sahtml-query/actions)
============

Fast and low memory query API for HTML (node.js).

Does not build DOM (Document Object Model).

Installation
------------

```
yarn add sahtml-query
```

Usage
-----

```javascript
var parse = require('sahtml-query').parse;

var resultHref = null;
var resultText = '';
parse(
  '<!doctype><html lang="en"><body><a id="hello" href="http://example.com">Hello <span>World</span></a></body></html>',
  (context) => {
    context.onElement('#hello', (linkContext, linkElement) => {
      resultHref = linkElement.attrs.href;
      linkContext.onElement('span', (spanContext, spanElement) => {
        spanContext.onText((textFragment) => resultText += textFragment);
      });
    });
  }
);

console.log(resultHref); // http://example.com
console.log(resultText); // World
```

API
---

```typescript
/**
 * Parses the specified HTML fragment and creates context in order to query
 * the contents of the HTML fragment.
 */
export function parse(html: string, parseCallback: ParseCallback);

export type ParseCallback = (context: SAContext) => void;

/**
 * Context which is passed to the callbacks of both `parse`
 * and `onElement` methods.
 */
export interface SAContext {
  /**
   * Matches subelement of the specified context.
   */
  onElement(cssSelector: string, callback: OnElementCallback);

  /**
   * Matches every text fragment of the specified context.
   */
  onText(callback: OnTextCallback);

  /**
   * This callback will be executed after leaving the context.
   */
  after(callback: () => void);
}

export type OnElementCallback = (context: SAContext, element: SAElement) => void;
export type OnTextCallback = (textFragment: string) => void;

/**
 * HTML element.
 */
export interface SAElement {
  /** HTML element tag name, always lower case */
  tagName: string;
  /** HTML element attributes */
  attrs: {[key: string]: string};
  /** Is true when HTML element auto closes, i.e. <img /> */
  autoEnd: boolean;
}
```

