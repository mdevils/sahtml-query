import {Entity, SAHtml} from 'sahtml';
import {SAContext} from './sa-context';
import {FragmentContext} from './fragment-context';
import {SAElement} from './tag-info';
import {tagPlacings} from './tag-placing';

const noContentElements: {[key: string]: true} = {
    area: true,
    base: true,
    basefont: true,
    br: true,
    col: true,
    frame: true,
    hr: true,
    img: true,
    input: true,
    isindex: true,
    link: true,
    param: true,
    meta: true
};

export class DocumentContext extends SAContext {
    protected parser: SAHtml;

    constructor(html: string) {
        super();
        this.parser = new SAHtml(html);
    }

    protected closeStackElementsAndReduceStack(stack: SAElement[], pos: number) {
        let i = stack.length - pos;
        while (i--) {
            const lastElement = stack.pop();
            if (lastElement) {
                this.consume('tagClose', lastElement!.tagName, stack)
            } else {
                throw new Error('Unexpected end of stack.');
            }
        }
    }

    protected isValidElement(tagName: string, stack: SAElement[]) {
        const tagPlacing = tagPlacings[tagName];
        if (!tagPlacing) {
            return true;
        }
        const parentConfig = tagPlacing.parent;
        if (!parentConfig) {
            return true;
        }
        const lastStackElement = stack[stack.length - 1];
        const {deleteWithoutParent} = parentConfig;
        return Boolean(
            !deleteWithoutParent || (lastStackElement && deleteWithoutParent[lastStackElement.tagName])
        );
    }

    public run() {
        let token: Entity;
        const stack: SAElement[] = [];
        while ((token = this.parser.next()).type !== 'eof') {
            if (token.type === 'tagDef') {
                const tagName = token.name;
                let omitElement = false;

                const tagPlacing = tagPlacings[tagName];
                if (tagPlacing) {
                    const overlap = tagPlacing.overlap;
                    if (overlap) {
                        const overlapWith = overlap.with || {};
                        for (let i = stack.length - 1; i >= 0; i--) {
                            const stackItem = stack[i];
                            if (stackItem.tagName === tagName || overlapWith[stackItem.tagName]) {
                                this.closeStackElementsAndReduceStack(stack, i);
                                break;
                            }
                            if (overlap.stop[stackItem.tagName]) {
                                break;
                            }
                        }
                    }
                    const parentConfig = tagPlacing.parent;
                    if (parentConfig) {
                        if ('requireDirectParent' in parentConfig) {
                            const lastStackElement = stack[stack.length - 1];
                            if (!lastStackElement || !parentConfig.requireDirectParent[lastStackElement.tagName]) {
                                if (this.isValidElement(parentConfig.defaultDirectParent, stack)) {
                                    const missingParent: SAElement = {
                                        tagName: parentConfig.defaultDirectParent,
                                        attrs: {},
                                        classNames: [],
                                        _classNameIndex: {}
                                    };
                                    stack.push(missingParent);
                                    this.consume('tagOpen', missingParent, stack)
                                } else {
                                    omitElement = true;
                                }
                            }
                        }
                    }
                }

                omitElement = omitElement || !this.isValidElement(tagName, stack);

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
                if (noContentElements[tagName]) {
                    autoEnd = true;
                }
                const element = {
                    tagName: tagName,
                    attrs: attrs,
                    classNames,
                    _classNameIndex,
                    autoEnd: autoEnd
                };
                if (!omitElement) {
                    stack.push(element);
                    this.consume('tagOpen', element, stack);
                    if (autoEnd) {
                        stack.pop();
                        this.consume('tagClose', tagName, stack);
                    }
                }
            } else if (token.type === 'string') {
                this.consume('text', token.value, stack);
            } else if (token.type === 'cdata') {
                this.consume('text', token.value, stack);
            } else if (token.type === 'tagClose') {
                for (let i = stack.length - 1; i >= 0; i--) {
                    const element = stack[i];
                    if (element.tagName === token.name) {
                        this.closeStackElementsAndReduceStack(stack, i);
                        break;
                    }
                }
            }
        }
        let unclosedTag;
        while (unclosedTag = stack.pop()) {
            this.consume('tagClose', unclosedTag.tagName, stack);
        }
    }

    protected createSubContext(stack: SAElement[]): SAContext {
        return new FragmentContext(this, stack);
    }
}
