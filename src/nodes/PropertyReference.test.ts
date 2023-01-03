import { testConflict } from '../conflicts/TestUtilities';
import { UnknownProperty } from '../conflicts/UnknownProperty';
import Evaluator from '../runtime/Evaluator';
import PropertyReference from './PropertyReference';
import Text from '../runtime/Text';
import { test, expect } from 'vitest';
import Source from './Source';
import Project from '../models/Project';
import Bind from './Bind';

test.each([
    [
        '•Cat(name•"") ()\nboomy: Cat("boom")\nboomy.name',
        '•Cat(name•"") ()\nboomy: Cat("boom")\nboomy.nam',
        PropertyReference,
        UnknownProperty,
    ],
])(
    'Expect %s no conflicts, %s to have %s with %s',
    (good, bad, node, conflict) => {
        testConflict(good, bad, node, conflict);
    }
);

test('Test scoping', () => {
    const code = `
            bystander: 1
            •Cat(name•””)
            sneaky: 1
            boomy: Cat(“boomy”)
            boomy.name
        `;

    const source = new Source('test', code);
    const project = new Project('test', source, []);
    const context = project.getContext(source);

    const prop = source.nodes().find((n) => n instanceof PropertyReference);

    expect(prop).toBeDefined();

    const defs = prop?.getDefinitionsInScope(context);

    expect(prop?.getDefinitionOfNameInScope('sneaky', context)).toBeUndefined();
    expect(
        prop?.getDefinitionOfNameInScope('bystander', context)
    ).toBeDefined();
    expect(
        defs?.find((n) => n instanceof Bind && n.hasName('sneaky'))
    ).toBeUndefined();
    expect(
        defs?.find((n) => n instanceof Bind && n.hasName('bystander'))
    ).toBeDefined();
});

test('Test access evaluate', () => {
    expect(
        Evaluator.evaluateCode("•Cat(name•'') ()\nCat('boomy').name")
    ).toBeInstanceOf(Text);
});
