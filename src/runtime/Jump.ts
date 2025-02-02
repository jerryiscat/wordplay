import type Expression from '@nodes/Expression';
import type Locale from '@locale/Locale';
import type Evaluator from '@runtime/Evaluator';
import Step from './Step';
import type Value from '../values/Value';
import concretize from '../locale/concretize';

export default class Jump extends Step {
    readonly count: number;

    constructor(count: number, node: Expression) {
        super(node);

        this.count = count;
    }

    evaluate(evaluator: Evaluator): Value | undefined {
        evaluator.jump(this.count);
        return undefined;
    }

    toString() {
        return super.toString() + ' ' + this.count;
    }

    getExplanations(locale: Locale) {
        return concretize(locale, locale.node.Conditional.afterthen);
    }
}
