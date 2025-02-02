import type Evaluator from '@runtime/Evaluator';
import ExceptionValue from '@values/ExceptionValue';
import type Locale from '@locale/Locale';
import type Expression from '@nodes/Expression';
import NodeRef from '@locale/NodeRef';
import concretize from '../locale/concretize';

export default class UnparsableException extends ExceptionValue {
    readonly unparsable: Expression;

    constructor(evaluator: Evaluator, unparsable: Expression) {
        super(unparsable, evaluator);

        this.unparsable = unparsable;
    }

    getExceptionText(locale: Locale) {
        return locale.node.UnparsableExpression.exception.UnparsableException;
    }

    getExplanation(locale: Locale) {
        return concretize(
            locale,
            this.getExceptionText(locale).explanation,
            new NodeRef(
                this.unparsable,
                locale,
                this.getNodeContext(this.unparsable)
            )
        );
    }
}
