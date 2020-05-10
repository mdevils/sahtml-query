import {SAElement} from './tag-info';
import {selectorMatches} from './tag-info';
import {parseCssSelector} from './parser';

export type OnElementCallback = (context: ElementContext) => void;
export type OnTextCallback = (text: TextContext) => void;

interface ContextMatcher {
    onElement(selector: string, callback: OnElementCallback): void;
    onText(callback: OnTextCallback): void;
    matches(selector: string): boolean;
    after(callback: () => void): void;
}

export class DocumentContext {
    constructor(
        protected context: ContextMatcher
    ) {}

    public onElement = (selector: string, callback: OnElementCallback): this => {
        this.context.onElement(selector, callback);
        return this;
    }

    public onText = (callback: OnTextCallback): this => {
        this.context.onText(callback);
        return this;
    }

    public after = (callback: () => void): this => {
        this.context.after(callback);
        return this;
    }
}

export class ElementContext extends DocumentContext {
    constructor(
        public element: SAElement,
        protected context: ContextMatcher
    ) {
        super(context);
    }

    public matches = (selector: string): boolean => {
        return this.context.matches(selector);
    }
}

export class TextContext {
    constructor(
        public text: string,
        protected stack: SAElement[]
    ) {}

    public matches = (selector: string): boolean => {
        return selectorMatches(this.stack, parseCssSelector(selector));
    }
}
