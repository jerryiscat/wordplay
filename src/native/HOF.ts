import type Bind from '@nodes/Bind';
import type Context from '@nodes/Context';
import Expression from '@nodes/Expression';
import FunctionDefinition from '@nodes/FunctionDefinition';
import type TypeSet from '@nodes/TypeSet';
import type Evaluator from '@runtime/Evaluator';
import type Locale from '@locale/Locale';
import Glyphs from '../lore/Glyphs';
import concretize from '../locale/locales/concretize';

export default abstract class HOF extends Expression {
    getGrammar() {
        return [];
    }

    /** Given an evaluator, get the binds of the inputs passed into the function. */
    getInputBinds(evaluator: Evaluator) {
        const fun = evaluator.getCurrentEvaluation()?.getDefinition();
        return fun instanceof FunctionDefinition ? fun.inputs : undefined;
    }

    /** Get the value of an input by index */
    getInput(index: number, evaluator: Evaluator) {
        const inputs = this.getInputBinds(evaluator);
        if (inputs === undefined) return undefined;
        const names = inputs[index].names;
        if (names === undefined) return undefined;
        return evaluator.resolve(names);
    }

    computeConflicts() {}

    // We don't clone these, we just erase their parent, since there's only one of them.
    clone() {
        return this;
    }

    evaluateTypeSet(
        bind: Bind,
        original: TypeSet,
        current: TypeSet,
        context: Context
    ) {
        context;
        bind;
        original;
        return current;
    }

    getDependencies(context: Context): Expression[] {
        // Higher order functions expressions depend on the inputs of their FunctionDefinitions.
        const parent = this.getParent(context);
        return parent instanceof FunctionDefinition ? parent.inputs : [];
    }

    isConstant() {
        return false;
    }

    getStart() {
        return this;
    }

    getFinish() {
        return this;
    }

    getNodeLocale(translation: Locale) {
        return translation.node.HOF;
    }

    getStartExplanations(locale: Locale) {
        return concretize(locale, locale.node.HOF.start);
    }

    getFinishExplanations(
        locale: Locale,
        context: Context,
        evaluator: Evaluator
    ) {
        return concretize(
            locale,
            locale.node.HOF.finish,
            this.getValueIfDefined(locale, context, evaluator)
        );
    }

    getGlyphs() {
        return Glyphs.Function;
    }
}
