import {SAContext} from './sa-context';
import {DocumentContext} from './document-context';

export type ParseCallback = (context: SAContext) => void;

/**
 * Parses the specified HTML fragment and creates context in order to query
 * the contents of the HTML fragment.
 */
export function parse(html: string, callback: ParseCallback) {
    const documentContext = new DocumentContext(html);
    callback(documentContext);
    documentContext.run();
}
