import type Context from '@nodes/Context';
import type FunctionDefinition from '@nodes/FunctionDefinition';
import type StructureDefinition from '@nodes/StructureDefinition';
import NodeRef from '@locale/NodeRef';
import type Locale from '@locale/Locale';
import Conflict from './Conflict';
import concretize from '../locale/concretize';

export class UnimplementedInterface extends Conflict {
    readonly structure: StructureDefinition;
    readonly interfaceStructure: StructureDefinition;
    readonly fun: FunctionDefinition;

    constructor(
        structure: StructureDefinition,
        interfaceStructure: StructureDefinition,
        fun: FunctionDefinition
    ) {
        super(false);
        this.structure = structure;
        this.interfaceStructure = interfaceStructure;
        this.fun = fun;
    }

    getConflictingNodes() {
        return {
            primary: {
                node: this.structure,
                explanation: (locale: Locale, context: Context) =>
                    concretize(
                        locale,
                        locale.node.StructureDefinition.conflict
                            .UnimplementedInterface,
                        new NodeRef(
                            this.interfaceStructure,
                            locale,
                            context,
                            this.interfaceStructure.names.getPreferredNameString(
                                [locale]
                            )
                        ),
                        new NodeRef(
                            this.fun,
                            locale,
                            context,
                            this.fun.names.getPreferredNameString([locale])
                        )
                    ),
            },
        };
    }
}
