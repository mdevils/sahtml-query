import {Entity, SAHtml} from 'sahtml';
import {SAContext} from './sa-context';
import {FragmentContext} from './fragment-context';
import {SAElement} from './tag-info';

export class DocumentContext extends SAContext {
    protected parser: SAHtml;

    constructor(html: string) {
        super();
        this.parser = new SAHtml(html);
    }

    public run() {
        let token: Entity;
        const stack = [];
        while ((token = this.parser.next()).type !== 'eof') {
            if (token.type === 'tagDef') {
                const tagName = token.name;
                const attrs: {[key: string]: string | undefined} = {};
                token = this.parser.next();
                let autoEnd = false;
                let classNames: string[] = [];
                let _classNameIndex: {[className: string]: true} = {};
                while (true) {
                    if (token.type === 'eof' || token.type === 'tagDefAutoEnd') {
                        autoEnd = true;
                        break;
                    }
                    if (token.type === 'tagDefEnd') {
                        break;
                    }
                    if (token.type === 'tagAttr') {
                        const attrName = token.name.toLowerCase();
                        const attrValue = token.value;
                        attrs[attrName] = attrValue;
                        if (attrName === 'class' && attrValue) {
                            classNames = attrValue.trim().split(/\s+/);
                            for (let className of classNames) {
                                _classNameIndex[className] = true;
                            }
                        }
                    }
                    token = this.parser.next();
                }
                const element = {
                    tagName: tagName,
                    attrs: attrs,
                    classNames,
                    _classNameIndex,
                    autoEnd: autoEnd
                };
                stack.push(element);
                this.consume('tagOpen', element, stack);
                if (autoEnd) {
                    stack.pop();
                    this.consume('tagClose', tagName, stack);
                }
            } else if (token.type === 'string') {
                this.consume('text', token.value, stack);
            } else if (token.type === 'tagClose') {
                let lastTag = stack[stack.length - 1];
                if (lastTag && lastTag.tagName === token.name) {
                    stack.pop();
                }
                this.consume('tagClose', token.name, stack);
            }
        }
    }

    protected createSubContext(stack: SAElement[]): SAContext {
        return new FragmentContext(this, stack);
    }
}
