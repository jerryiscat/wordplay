import type Language from '@nodes/Language';
import type Token from '@nodes/Token';
import type Locale from '@locale/Locale';
import Conflict from './Conflict';
import concretize from '../locale/concretize';

export default class UnknownLanguage extends Conflict {
    readonly language: Language;
    readonly code: Token;

    constructor(language: Language, code: Token) {
        super(true);
        this.language = language;
        this.code = code;
    }

    getConflictingNodes() {
        return {
            primary: {
                node: this.language,
                explanation: (locale: Locale) =>
                    concretize(
                        locale,
                        locale.node.Language.conflict.UnknownLanguage
                    ),
            },
        };
    }
}
