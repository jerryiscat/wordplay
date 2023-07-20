import Node from '@nodes/Node';
import Revision from './Revision';
import type LanguageCode from '@locale/LanguageCode';
import type { Edit } from '../components/editor/util/Commands';
import Refer from './Refer';
import Caret from './Caret';
import type Context from '@nodes/Context';
import type Locale from '@locale/Locale';
import concretize from '../locale/concretize';

export default class Append<NodeType extends Node> extends Revision {
    readonly parent: Node;
    readonly position: number;
    /** Undefined means after the last child. Otherwise, the node should be whatever child we're inserting before, even if it's not part of the list. */
    readonly index: number;
    readonly list: Node[];
    readonly insertion: NodeType | Refer;

    constructor(
        context: Context,
        position: number,
        parent: Node,
        list: Node[],
        index: number,
        insertion: NodeType | Refer
    ) {
        super(context);

        this.parent = parent;
        this.position = position;
        this.list = list;
        this.index = index;
        this.insertion = insertion;
    }

    getEdit(lang: LanguageCode[]): Edit | undefined {
        const [newChild, newParent] = this.getEditedNode(lang);

        // Find the space before the insertion by finding the token that contains the index.
        // Insert the space we find before it.
        const newSpaces = Revision.splitSpace(
            this.context.source,
            this.position,
            newChild
        );

        // Make a new program with the new parent
        let newProgram = this.context.source.expression.replace(
            this.parent,
            newParent
        );

        // Clone the source with the new parent.
        const newSource = this.context.source.withProgram(
            newProgram,
            newSpaces
        );

        // Find it's last token index.
        let newCaretPosition: Node | number | undefined =
            newSource.getNodeLastPosition(newChild);

        // Does the insertion have a placeholder token? If so, place the caret at it's first placeholder instead of the end.
        const firstPlaceholder = newChild.getFirstPlaceholder();
        if (firstPlaceholder) newCaretPosition = firstPlaceholder;

        // Return the new source and put the caret immediately after the inserted new child.
        return [
            newSource,
            new Caret(
                newSource,
                newCaretPosition ?? this.position,
                undefined,
                undefined,
                newChild
            ),
        ];
    }

    getEditedNode(lang: LanguageCode[]): [Node, Node] {
        // Get the node to insert.
        let newChild = this.getNewNode(lang);

        // Clone the list.
        let newList = [...this.list];

        // Insert the new child in the list.
        // If its unspecified or it is but it's not in the list, then it's at the end of the list.
        // If a child before was given and it's in the list, then
        newList.splice(this.index, 0, newChild);

        // Clone the parent with the new list, pretty printing.
        const newParent = this.parent.replace(this.list, newList);

        return [newChild, newParent];
    }

    getDescription(locale: Locale) {
        let node =
            this.insertion instanceof Refer
                ? this.insertion.getNode([locale.language])
                : this.getNewNode([locale.language]);
        return concretize(locale, locale.ui.edit.append, node.getLabel(locale));
    }

    getNewNode(languages: LanguageCode[]): Node {
        if (this.insertion instanceof Node) return this.insertion;
        else return this.insertion.getNode(languages);
    }

    equals(transform: Revision): boolean {
        return (
            transform instanceof Append &&
            this.index === transform.index &&
            this.list === transform.list &&
            ((this.insertion instanceof Node &&
                transform.insertion instanceof Node &&
                this.insertion.isEqualTo(transform.insertion)) ||
                (this.insertion instanceof Refer &&
                    transform.insertion instanceof Refer &&
                    this.insertion.equals(transform.insertion)))
        );
    }

    toString() {
        return `insert ${this.insertion.toString()}`;
    }
}
