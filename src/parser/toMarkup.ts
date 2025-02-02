import type Spaces from './Spaces';
import type Markup from '../nodes/Markup';
import { DOCS_SYMBOL } from './Symbols';
import { toTokens } from './toTokens';
import parseDoc from './parseDoc';

export function toMarkup(template: string): [Markup, Spaces] {
    const tokens = toTokens(DOCS_SYMBOL + template + DOCS_SYMBOL);
    return [parseDoc(tokens).markup, tokens.getSpaces()];
}
