import type Source from '@nodes/Source';
import type Borrow from '@nodes/Borrow';
import type Program from '@nodes/Program';
import Conflict from './Conflict';
import type Locale from '@locale/Locale';
import type Context from '@nodes/Context';
import NodeRef from '@locale/NodeRef';
import concretize from '../locale/concretize';

export class BorrowCycle extends Conflict {
    readonly program: Program;
    readonly borrow: Borrow;
    readonly cycle: Source[];

    constructor(program: Program, borrow: Borrow, cycle: Source[]) {
        super(false);
        this.program = program;
        this.borrow = borrow;
        this.cycle = cycle;
    }

    getConflictingNodes() {
        return {
            primary: {
                node: this.borrow,
                explanation: (locale: Locale, context: Context) =>
                    concretize(
                        locale,
                        locale.node.Borrow.conflict.BorrowCycle,
                        new NodeRef(
                            this.borrow,
                            locale,
                            context,
                            this.cycle[0].names.getPreferredNameString([locale])
                        )
                    ),
            },
        };
    }
}
