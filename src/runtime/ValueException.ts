import Exception from './Exception';
import type Evaluator from './Evaluator';
import type Locale from '@locale/Locale';
import type Expression from '@nodes/Node';
import NodeLink from '@locale/NodeLink';
import concretize from '../locale/locales/concretize';

export default class ValueException extends Exception {
    readonly expression: Expression;
    constructor(evaluator: Evaluator, expression: Expression) {
        super(evaluator);
        this.expression = expression;
    }

    getDescription(locale: Locale) {
        return concretize(
            locale,
            locale.exceptions.value,
            new NodeLink(
                this.expression,
                locale,
                this.getNodeContext(this.expression)
            )
        );
    }
}
