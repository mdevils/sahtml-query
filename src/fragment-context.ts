import {SAContext} from './sa-context';
import {SAElement} from './tag-info';

export class FragmentContext extends SAContext {
    protected unsubscribe: () => void;
    protected stackLength: number;

    constructor(parentContext: SAContext, stack: SAElement[]) {
        super();
        this.unsubscribe = (parentContext as any).subscribe(this.consume, this);
        this.stackLength = stack.length;
    }

    protected consume(type: string, data: SAElement | string, stack: SAElement[]) {
        super.consume(type, data, stack);
        if (type === 'tagClose' && stack.length < this.stackLength) {
            this.unsubscribe();
            this.destroy();
        }
    }

    protected createSubContext(stack: SAElement[]): SAContext {
        return new FragmentContext(this, stack);
    }
}
