import type Names from "../nodes/Names";
import StreamType from "../nodes/StreamType";
import StructureType from "../nodes/StructureType";
import { TRANSLATE } from "../nodes/Translations";
import Unit from "../nodes/Unit";
import Measurement from "../runtime/Measurement";
import Stream from "../runtime/Stream";
import Structure, { createStructure } from "../runtime/Structure";
import type Value from "../runtime/Value";
import Place from "../native/Place";
import type Evaluator from "../runtime/Evaluator";

function position(evaluator: Evaluator, x: number, y: number) {
    const bindings = new Map<Names, Value>();
    bindings.set(Place.inputs[0].names, new Measurement(evaluator.getMain(), x, Unit.unit([ "px"])));
    bindings.set(Place.inputs[1].names, new Measurement(evaluator.getMain(), y, Unit.unit([ "px"])));
    return createStructure(evaluator, Place, bindings)
}

export default class MousePosition extends Stream<Structure> {

    readonly evaluator: Evaluator;
    on: boolean = false;

    constructor(evaluator: Evaluator) {
        super(
            evaluator,
            {
                eng: "A stream of mouse move events",
                "😀": TRANSLATE
            }, 
            {
                "😀": "⌖",
                eng: "mouse"
            },
            position(evaluator, 0, 0)
        );

        this.evaluator = evaluator;
    }

    record(x: number, y: number) {
        if(this.on)
            this.add(position(this.evaluator, x, y));
    }

    start() {
        this.on = true;
    }
    stop() {
        this.on = false;
    }

    getType() { return new StreamType(new StructureType(Place)); }

}