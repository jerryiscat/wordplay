import type Value from "../runtime/Value";
import Output from "./Output";

export default class TexfLang extends Output {

    readonly text: string;
    readonly lang: string | undefined;

    constructor(value: Value, text: string, lang: string | undefined = undefined) {
        super(value);

        this.text = text;
        this.lang = lang;

    }
}