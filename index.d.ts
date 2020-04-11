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
