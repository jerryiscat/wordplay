import type Definition from '@nodes/Definition';
import TypeVariable from '@nodes/TypeVariable';
import type Context from '@nodes/Context';
import type Node from '@nodes/Node';
import type Locale from '../locale/Locale';

export default class Refer {
    readonly creator: (name: string, operator?: string) => Node;
    readonly definition: Definition;

    constructor(
        creator: (name: string, op?: string) => Node,
        definition: Definition
    ) {
        this.creator = creator;
        this.definition = definition;
    }

    getNode(locales: Locale[]) {
        return this.creator(
            this.definition.getPreferredName(locales),
            this.definition.names.getSymbolicName()
        );
    }

    getType(context: Context) {
        return this.definition instanceof TypeVariable
            ? undefined
            : this.definition.getType(context);
    }

    equals(refer: Refer) {
        return refer.definition === this.definition;
    }

    toString() {
        return `${this.definition.getNames()[0]}`;
    }
}
