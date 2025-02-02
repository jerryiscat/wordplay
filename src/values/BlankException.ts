import type Locale from '@locale/Locale';
import type Program from '../nodes/Program';
import type Evaluator from '@runtime/Evaluator';
import ExceptionValue from '@values/ExceptionValue';
import concretize from '../locale/concretize';
import type { ExceptionText } from '../locale/NodeTexts';

export default class BlankException extends ExceptionValue {
    readonly program: Program;

    constructor(evaluator: Evaluator, program: Program) {
        super(program, evaluator);

        this.program = program;
    }

    getExceptionText(locale: Locale): ExceptionText {
        return locale.node.Program.exception.BlankException;
    }

    getExplanation(locale: Locale) {
        return concretize(locale, this.getExceptionText(locale).explanation);
    }
}
