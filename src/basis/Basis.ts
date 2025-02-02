import FunctionDefinition from '@nodes/FunctionDefinition';
import InternalExpression from './InternalExpression';
import type Context from '@nodes/Context';
import Type from '@nodes/Type';
import ConversionDefinition from '@nodes/ConversionDefinition';
import Value from '@values/Value';
import type Evaluation from '@runtime/Evaluation';
import type StructureDefinition from '@nodes/StructureDefinition';
import bootstrapNone from './NoneBasis';
import bootstrapBool from './BoolBasis';
import bootstrapText from './TextBasis';
import bootstrapList from './ListBasis';
import bootstrapNumber from './NumberBasis';
import bootstrapSet from './SetBasis';
import bootstrapMap from './MapBasis';
import Block from '@nodes/Block';
import type { BasisTypeName } from './BasisConstants';
import type TypeVariables from '@nodes/TypeVariables';
import type Docs from '@nodes/Docs';
import type Expression from '@nodes/Expression';
import Root from '../nodes/Root';
import type Locale from '../locale/Locale';
import createDefaultShares from '@runtime/createDefaultShares';
import type LanguageCode from '../locale/LanguageCode';
import bootstrapTable from './TableBasis';
import {
    createInputs,
    type FunctionText,
    type NameAndDoc,
} from '../locale/Locale';
import { getDocLocales } from '../locale/getDocLocales';
import { getNameLocales } from '../locale/getNameLocales';
import bootstrapStructure from './StructureBasis';
import { toTokens } from '../parser/toTokens';
import parseType from '../parser/paresType';

export class Basis {
    readonly locales: Locale[];
    readonly languages: LanguageCode[];
    readonly shares: ReturnType<typeof createDefaultShares>;

    /**
     * A global collection of Basis for every combination of language codes.
     * The key in this case is the join of a sequence of LanguageCode.
     */
    static readonly Bases: Map<string, Basis> = new Map();

    constructor(locales: Locale[]) {
        this.locales = locales;
        this.languages = locales.map((locale) => locale.language);

        this.addStructure('none', bootstrapNone(locales));
        this.addStructure('boolean', bootstrapBool(locales));
        this.addStructure('text', bootstrapText(locales));
        this.addStructure('list', bootstrapList(locales));
        this.addStructure('measurement', bootstrapNumber(locales));
        this.addStructure('set', bootstrapSet(locales));
        this.addStructure('map', bootstrapMap(locales));
        this.addStructure('table', bootstrapTable(locales));
        this.addStructure('structure', bootstrapStructure(locales));

        this.shares = createDefaultShares(locales);
    }

    static getLocalizedBasis(locales: Locale | Locale[]) {
        locales = Array.isArray(locales) ? locales : [locales];
        const languages = locales.map((locale) => locale.language);
        const key = languages.join(',');
        const basis = Basis.Bases.get(key) ?? new Basis(locales);
        Basis.Bases.set(key, basis);
        return basis;
    }

    readonly functionsByType: Record<
        string,
        Record<string, FunctionDefinition>
    > = {};
    readonly conversionsByType: Record<string, ConversionDefinition[]> = {};
    readonly structureDefinitionsByName: Record<string, StructureDefinition> =
        {};
    readonly roots: Root[] = [];

    addFunction(kind: BasisTypeName, fun: FunctionDefinition) {
        if (!(kind in this.functionsByType)) this.functionsByType[kind] = {};

        fun.names.names.forEach((a) => {
            const name = a.getName();
            if (name !== undefined) this.functionsByType[kind][name] = fun;
        });
    }

    addConversion(kind: BasisTypeName, conversion: ConversionDefinition) {
        if (!(kind in this.conversionsByType))
            this.conversionsByType[kind] = [];

        this.conversionsByType[kind].push(conversion);
    }

    addStructure(kind: BasisTypeName, structure: StructureDefinition) {
        // Cache the parents of the nodes, "crystalizing" it.
        // This means there should be no future changes to the basis structure definition.
        this.structureDefinitionsByName[kind] = structure;

        if (structure.expression instanceof Block) {
            for (const statement of structure.expression.statements) {
                if (statement instanceof FunctionDefinition)
                    this.addFunction(kind, statement);
                else if (statement instanceof ConversionDefinition)
                    this.addConversion(kind, statement);
            }
        }

        this.roots.push(new Root(structure));
    }

    getConversion(
        kind: string,
        context: Context,
        input: Type,
        output: Type
    ): ConversionDefinition | undefined {
        if (!(kind in this.conversionsByType)) return undefined;
        return this.conversionsByType[kind].find((c) =>
            c.convertsTypeTo(input, output, context)
        );
    }

    getAllConversions() {
        // Copy it so that callers can't modify it.
        return Object.values(this.conversionsByType).reduce(
            (all: ConversionDefinition[], next: ConversionDefinition[]) => [
                ...all,
                ...next,
            ],
            []
        );
    }

    getFunction(
        kind: BasisTypeName,
        name: string
    ): FunctionDefinition | undefined {
        if (!(kind in this.functionsByType)) return undefined;
        return this.functionsByType[kind][name];
    }

    getStructureDefinition(
        kind: BasisTypeName
    ): StructureDefinition | undefined {
        return this.structureDefinitionsByName[kind];
    }

    getAllStructureDefinitions() {
        return Object.values(this.structureDefinitionsByName);
    }

    getSimpleDefinition(name: BasisTypeName) {
        return this.structureDefinitionsByName[name];
    }
}

export function createBasisFunction(
    locales: Locale[],
    text: (locale: Locale) => FunctionText<NameAndDoc[]>,
    typeVars: TypeVariables | undefined,
    types: (Type | [Type, Expression])[],
    output: Type,
    evaluator: (requestor: Expression, evaluator: Evaluation) => Value
) {
    return FunctionDefinition.make(
        getDocLocales(locales, (l) => text(l).doc),
        getNameLocales(locales, (l) => text(l).names),
        typeVars,
        createInputs(locales, (l) => text(l).inputs, types),
        new InternalExpression(output, [], evaluator),
        output
    );
}

export function createBasisConversion<ValueType extends Value>(
    docs: Docs,
    input: Type | string,
    output: Type | string,
    convert: (requestor: Expression, value: ValueType) => Value
) {
    // Parse the expected type.
    const inputType =
        input instanceof Type ? input : parseType(toTokens(input));
    const outputType =
        output instanceof Type ? output : parseType(toTokens(output));

    return ConversionDefinition.make(
        docs,
        inputType,
        output,
        new InternalExpression(outputType, [], (requestor, evaluation) => {
            const val = evaluation.getClosure();
            if (
                val instanceof Value &&
                inputType.accepts(
                    val.getType(evaluation.getContext()),
                    evaluation.getContext()
                )
            )
                return convert(requestor, val as ValueType);
            else
                return evaluation.getValueOrTypeException(
                    requestor,
                    inputType,
                    val
                );
        })
    );
}
