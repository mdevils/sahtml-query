import {SAElement} from './tag-info';
import {FlatSelector} from './parser';
import {selectorMatches} from './tag-info';
import {parseCssSelector} from './parser';

const generateId = (() => {
    let lastId = 0;
    return () => 'id' + (lastId++);
})();

export type OnElementCallback = (context: SAContext, element: SAElement) => void;
export type OnTextCallback = (text: string) => void;

type SubscriptionCallback = (type: string, data: SAElement | string, stack: SAElement[]) => void;

interface Subscription {
    callback: SubscriptionCallback;
    context: unknown;
}

interface SubContext {
    selector?: FlatSelector;
    callback: (...args: any[]) => void;
}

export type ConsumeEventType = 'tagOpen' | 'tagClose' | 'text';

export class SAContext {
    protected subscriptions: {[id: string]: Subscription};
    protected subContexts: {[id: string]: SubContext};
    protected afterCallback: null | (() => void);

    constructor() {
        this.subscriptions = {};
        this.subContexts = {};
        this.afterCallback = null;
    }

    public onText(callback: OnTextCallback) {
        const newId = generateId();
        this.subContexts[newId] = {callback: callback};
        return this;
    };

    public onElement(selector: string, callback: OnElementCallback) {
        const newId = generateId();
        this.subContexts[newId] = {
            callback: callback,
            selector: parseCssSelector(selector)
        };
        return this;
    };

    public after(callback: () => void) {
        /**
         * @const {Function}
         * @private
         */
        this.afterCallback = callback;
        return this;
    }

    protected subscribe(callback: SubscriptionCallback, context: unknown) {
        const newId = generateId();
        const subscriptions = this.subscriptions;
        subscriptions[newId] = {
            callback: callback,
            context: context
        };
        return function () {
            delete subscriptions[newId];
        };
    };

    protected consume(type: ConsumeEventType, data: string | SAElement, stack: SAElement[]) {
        this.emit(type, data, stack);
        const subContextKeys = Object.keys(this.subContexts);
        let subContext: SubContext;
        let subContextKey: string;
        let i = 0;
        if (type === 'tagOpen') {
            for (; i < subContextKeys.length; i++) {
                subContextKey = subContextKeys[i];
                subContext = this.subContexts[subContextKey];
                const selector = subContext.selector;
                if (selector && selectorMatches(stack, selector)) {
                    subContext.callback(this.createSubContext(stack), data);
                }
            }
            return;
        }
        if (type === 'text') {
            for (; i < subContextKeys.length; i++) {
                subContextKey = subContextKeys[i];
                subContext = this.subContexts[subContextKey];
                if (!subContext.selector) {
                    subContext.callback(data);
                }
            }
        }
    }

    protected createSubContext(_: SAElement[]): SAContext {
        return new SAContext();
    }

    protected emit(type: string, data: SAElement | string, stack: SAElement[]) {
        const subscriptions = this.subscriptions;
        const subscriptionIds = Object.keys(subscriptions);
        for (let i = 0; i < subscriptionIds.length; i++) {
            const subscription = this.subscriptions[subscriptionIds[i]];
            subscription.callback.call(subscription.context, type, data, stack);
        }
    }

    protected destroy() {
        this.afterCallback && this.afterCallback();
    }
}
