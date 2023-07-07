import type This from '@nodes/This';
import type Locale from '@locale/Locale';
import Conflict from './Conflict';
import concretize from '../locale/locales/concretize';

export class MisplacedThis extends Conflict {
    readonly dis: This;
    constructor(dis: This) {
        super(false);
        this.dis = dis;
    }

    getConflictingNodes() {
        return {
            primary: {
                node: this.dis,
                explanation: (locale: Locale) =>
                    concretize(locale, locale.conflict.MisplacedThis),
            },
        };
    }
}
