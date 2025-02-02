import ExceptionValue from '@values/ExceptionValue';
import type Evaluator from '@runtime/Evaluator';
import type Locale from '@locale/Locale';
import type Token from '@nodes/Token';
import Value from '../values/Value';
import NodeRef from '@locale/NodeRef';
import ValueRef from '@locale/ValueRef';
import concretize from '../locale/concretize';
import type Expression from '../nodes/Expression';

export default class NameException extends ExceptionValue {
    readonly name: Token | undefined;
    readonly scope: Value | undefined;

    constructor(
        reference: Expression,
        name: Token | undefined,
        scope: Value | undefined,
        evaluator: Evaluator
    ) {
        super(reference, evaluator);

        this.name = name;
        this.scope = scope;
    }

    getExceptionText(locale: Locale) {
        return locale.node.Reference.exception.NameException;
    }

    getExplanation(locale: Locale) {
        return concretize(
            locale,
            this.getExceptionText(locale).explanation,
            this.name
                ? new NodeRef(
                      this.name,
                      locale,
                      this.getNodeContext(this.name),
                      this.name.getText()
                  )
                : undefined,
            this.scope instanceof Value
                ? new ValueRef(
                      this.scope,
                      locale,
                      this.getNodeContext(this.scope.creator)
                  )
                : undefined
        );
    }
}
