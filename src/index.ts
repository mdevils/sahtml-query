import {DocumentVisitor} from './document-visitor';
import {DocumentContext} from './context';

export type ParseCallback = (context: DocumentContext) => void;

/**
 * Parses the specified HTML fragment and creates context in order to query
 * the contents of the HTML fragment.
 */
export function parse(html: string, callback: ParseCallback) {
    const documentVisitor = new DocumentVisitor(html);
    callback(new DocumentContext(documentVisitor));
    documentVisitor.run();
}
