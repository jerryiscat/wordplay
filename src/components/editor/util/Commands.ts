import type Caret from './Caret';
import Node from '@nodes/Node';
import {
    BORROW_SYMBOL,
    CONVERT_SYMBOL,
    FALSE_SYMBOL,
    FUNCTION_SYMBOL,
    SHARE_SYMBOL,
    STREAM_SYMBOL,
    TRUE_SYMBOL,
    TYPE_SYMBOL,
    PREVIOUS_SYMBOL,
    TYPE_OPEN_SYMBOL,
    TYPE_CLOSE_SYMBOL,
    ETC_SYMBOL,
} from '@parser/Symbols';

import { AND_SYMBOL, OR_SYMBOL, NOT_SYMBOL } from '@parser/Symbols';

import type Source from '@nodes/Source';
import Evaluator, { Mode } from '@runtime/Evaluator';
import { toClipboard } from './Clipboard';

export type Edit = Caret | [Source, Caret];

export type Command = {
    description: string;
    key?: string;
    shift?: boolean;
    alt?: boolean;
    control?: boolean;
    mode: Mode | undefined;
    execute: (
        caret: Caret,
        editor: HTMLElement,
        evaluator: Evaluator,
        key: string
    ) => Edit | Promise<Edit | undefined> | boolean | undefined;
};

const commands: Command[] = [
    {
        description:
            'Move caret up a line to the closest horizontal position visually',
        alt: false,
        key: 'ArrowUp',
        mode: undefined,
        execute: (caret: Caret, editor: HTMLElement) =>
            caret.moveVertical(editor, -1),
    },
    {
        description:
            'Move caret down a line to the closest horizontal position visually',
        alt: false,
        key: 'ArrowDown',
        mode: undefined,
        execute: (caret: Caret, editor: HTMLElement) =>
            caret.moveVertical(editor, 1),
    },
    {
        description: 'Move the caret one position left',
        alt: false,
        key: 'ArrowLeft',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.left(),
    },
    {
        description: 'Move the caret one position right',
        alt: false,
        key: 'ArrowRight',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.right(),
    },
    {
        description: 'Move the caret one position left',
        alt: false,
        key: 'ArrowLeft',
        mode: Mode.STEP,
        execute: (caret: Caret) => caret.moveNodeHorizontal(-1),
    },
    {
        description: 'Move the caret one position right',
        alt: false,
        key: 'ArrowRight',
        mode: Mode.STEP,
        execute: (caret: Caret) => caret.moveNodeHorizontal(1),
    },
    {
        description: 'Select the parent of the current caret position',
        key: 'Escape',
        control: false,
        mode: Mode.PLAY,
        execute: (caret: Caret) => {
            const position = caret.position;
            if (position instanceof Node) {
                // Select the parent node
                let parent: Node | undefined | null = caret.source
                    .get(position)
                    ?.getParent();
                // // What tokens are selected currently?
                // const selectedTokens = position.nodes(n => n instanceof Token) as Token[];
                // let parentTokens = parent?.nodes(n => n instanceof Token) as Token[];
                // // While the parent's nodes are equivalent to the previous selection, keep going up the hierarchy.
                // while(parent && parentTokens.length === selectedTokens.length && !(parent instanceof ExpressionPlaceholder) && parentTokens.every((t, i) => t === selectedTokens[i])) {
                //     const newParent = parent.getParent();
                //     if(newParent) {
                //         parent = newParent;
                //         parentTokens = parent.nodes(n => n instanceof Token) as Token[];
                //     }
                //     else break;
                // }
                // If we still have a parent,
                if (parent) return caret.withPosition(parent);
            }
            // Find the node corresponding to the position.
            // And if it's parent only has the one child, select it.
            else {
                const token =
                    caret.atTokenEnd() && caret.hasSpaceAfter()
                        ? caret.tokenPrior
                        : caret.getToken();
                if (token !== undefined) {
                    const parent = caret.source.get(token)?.getParent();
                    return caret.withPosition(
                        parent?.getChildren()[0] === token ? parent : token
                    );
                }
            }
        },
    },
    {
        description: 'Select the entire program',
        control: true,
        key: 'KeyA',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.withPosition(caret.getProgram()),
    },
    {
        description: `Insert reaction symbol (${STREAM_SYMBOL})`,
        alt: true,
        key: 'KeyD',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(STREAM_SYMBOL),
    },
    {
        description: `Insert borrow symbol (${BORROW_SYMBOL})`,
        alt: true,
        key: 'ArrowDown',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(BORROW_SYMBOL),
    },
    {
        description: `Insert previous symbol (${PREVIOUS_SYMBOL})`,
        alt: true,
        key: 'ArrowLeft',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(PREVIOUS_SYMBOL),
    },
    {
        description: `Insert convert symbol (${CONVERT_SYMBOL})`,
        alt: true,
        key: 'ArrowRight',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(CONVERT_SYMBOL),
    },
    {
        description: `Insert share symbol (${SHARE_SYMBOL})`,
        alt: true,
        key: 'ArrowUp',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(SHARE_SYMBOL),
    },
    {
        description: `Insert type open symbol (${TYPE_OPEN_SYMBOL})`,
        shift: true,
        control: true,
        key: 'Digit9',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(TYPE_OPEN_SYMBOL),
    },
    {
        description: `Insert type close symbol (${TYPE_CLOSE_SYMBOL})`,
        shift: true,
        control: true,
        key: 'Digit0',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(TYPE_CLOSE_SYMBOL),
    },
    {
        description: `Insert share (${SHARE_SYMBOL})`,
        alt: true,
        key: 'ArrowUp',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(SHARE_SYMBOL),
    },
    {
        description: `Insert infinity symbol (∞)`,
        alt: true,
        key: 'Digit5',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('∞'),
    },
    {
        description: 'Insert pi symbol (π)',
        alt: true,
        key: 'KeyP',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('π'),
    },
    {
        description: `Insert Boolean AND symbol (${AND_SYMBOL})`,
        alt: true,
        key: 'Digit6',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(AND_SYMBOL),
    },
    {
        description: `Insert Boolean OR symbol (${OR_SYMBOL})`,
        alt: true,
        key: 'Digit7',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(OR_SYMBOL),
    },
    {
        description: `Insert type symbol (${TYPE_SYMBOL})`,
        shift: false,
        alt: true,
        key: 'Digit8',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(TYPE_SYMBOL),
    },
    {
        description: `Insert true symbol (${TRUE_SYMBOL})`,
        shift: false,
        control: false,
        alt: true,
        key: 'Digit9',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(TRUE_SYMBOL),
    },
    {
        description: `Insert false symbol (${FALSE_SYMBOL})`,
        shift: false,
        control: false,
        alt: true,
        key: 'Digit0',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(FALSE_SYMBOL),
    },
    {
        description: 'Insert not equal symbol (≠)',
        alt: true,
        key: 'Equal',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('≠'),
    },
    {
        description: `Insert function symbol (${FUNCTION_SYMBOL})`,
        alt: true,
        key: 'KeyF',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(FUNCTION_SYMBOL),
    },
    {
        description: `Insert Boolean NOT symbol (${NOT_SYMBOL})`,
        alt: true,
        key: 'Digit1',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(NOT_SYMBOL),
    },
    {
        description: 'Insert less than or equal to symbol (≤)',
        alt: true,
        key: 'Comma',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('≤'),
    },
    {
        description: 'Insert greater than or equal to symbol (≥)',
        alt: true,
        key: 'Period',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('≥'),
    },
    {
        description: `Insert etc symbol (${ETC_SYMBOL})`,
        alt: true,
        key: 'Semicolon',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert(ETC_SYMBOL),
    },
    {
        description: 'Insert multiply symbol (·)',
        alt: true,
        key: 'KeyX',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('·'),
    },
    {
        description: 'Insert divide symbol (÷)',
        alt: true,
        key: 'Slash',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('÷'),
    },
    {
        description: 'Insert new line',
        key: 'Enter',
        shift: false,
        alt: false,
        control: false,
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('\n'),
    },
    {
        description: 'Step to node',
        key: 'Enter',
        shift: false,
        alt: false,
        control: false,
        mode: Mode.STEP,
        execute: (caret: Caret, _, evaluator) => {
            if (caret.position instanceof Node) {
                const evaluable = evaluator.getEvaluableNode(caret.position);
                if (evaluable) evaluator.stepToNode(evaluable);
            }
            return undefined;
        },
    },
    {
        description: 'Insert tab',
        key: 'Tab',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.insert('\t'),
    },
    {
        description: 'Delete previous character',
        key: 'Backspace',
        mode: Mode.PLAY,
        execute: (caret: Caret) => caret.backspace(),
    },
    {
        description: 'Copy',
        control: true,
        key: 'KeyC',
        mode: Mode.PLAY,
        execute: (caret: Caret) => {
            if (!(caret.position instanceof Node)) return undefined;
            return toClipboard(caret.position, caret.source.spaces);
        },
    },
    {
        description: 'Paste',
        control: true,
        key: 'KeyV',
        mode: Mode.PLAY,
        execute: async (caret: Caret) => {
            // See if there's something on the clipboard.
            if (navigator.clipboard === undefined) return undefined;

            const items = await navigator.clipboard.read();
            for (const item of items) {
                for (const type of item.types) {
                    if (type === 'text/plain') {
                        const blob = await item.getType(type);
                        const text = await blob.text();
                        return caret.insert(text);
                    }
                }
            }
            return undefined;
        },
    },
];

export default commands;