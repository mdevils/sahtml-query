import {ConsumeEventType, Visitor} from './visitor';
import {SAElement} from './tag-info';

export class FragmentVisitor extends Visitor {
    protected unsubscribe: () => void;
    protected stackLength: number;

    constructor(parentContext: Visitor, stack: SAElement[]) {
        super(stack);
        this.unsubscribe = (parentContext as any).subscribe(this.consume, this);
        this.stackLength = stack.length;
    }

    protected consume(type: ConsumeEventType, data: SAElement | string, stack: SAElement[]) {
        super.consume(type, data, stack);
        if (type === 'tagClose' && stack.length < this.stackLength) {
            this.unsubscribe();
            this.destroy();
        }
    }

    protected createSubContext(stack: SAElement[]): Visitor {
        return new FragmentVisitor(this, stack);
    }
}
