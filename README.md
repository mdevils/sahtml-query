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
    (document) => {
        document.onElement('#hello', (link) => {
            resultHref = link.element.attrs.href;
            link.onElement('span', (span) => {
                span.onText(({text}) => resultText += text);
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

export type ParseCallback = (context: DocumentContext) => void;

/**
 * Context which is passed to the callbacks of both `parse`
 * and `onElement` methods.
 */
export interface DocumentContext {
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

export interface ElementContext extends DocumentContext {
    /**
     * HTML element information.
     */
    element: SAElement;

    /**
     * Checks if the current element matches the specified selector.
     */
    matches(selector: string): boolean;
}

export interface TextContext extends DocumentContext {
    /**
     * HTML text.
     */
    text: string;

    /**
     * Checks if the current element matches the specified selector.
     */
    matches(selector: string): boolean;
}

export type OnElementCallback = (context: ElementContext) => void;
export type OnTextCallback = (context: TextContext) => void;

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

