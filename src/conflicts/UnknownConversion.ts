import type Context from '@nodes/Context';
import type Convert from '@nodes/Convert';
import type Type from '@nodes/Type';
import NodeRef from '@locale/NodeRef';
import type Locale from '@locale/Locale';
import Conflict from './Conflict';
import concretize from '../locale/concretize';

export class UnknownConversion extends Conflict {
    readonly convert: Convert;
    readonly expectedType: Type;

    constructor(expr: Convert, expectedType: Type) {
        super(false);
        this.convert = expr;
        this.expectedType = expectedType;
    }

    getConflictingNodes() {
        return {
            primary: {
                node: this.convert,
                explanation: (locale: Locale, context: Context) =>
                    concretize(
                        locale,
                        locale.node.Convert.conflict.UnknownConversion,
                        new NodeRef(this.expectedType, locale, context),
                        new NodeRef(this.convert.type, locale, context)
                    ),
            },
        };
    }
}
