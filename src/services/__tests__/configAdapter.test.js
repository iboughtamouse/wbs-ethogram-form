/**
 * Config adapter tests, including the stage-D parity gate: the adapted
 * bundled snapshot must be semantically identical to the hardcoded constants
 * it replaces. When stage E deletes the constants, the parity suite goes
 * with them; the shape tests stay.
 */

import { adaptConfig } from '../configAdapter';
import { bundledConfig } from '../configService';
import {
  BEHAVIORS,
  BEHAVIOR_GROUP_ORDER,
  getGroupedBehaviors,
  INANIMATE_OBJECTS,
  OBJECT_INTERACTION_TYPES,
  ANIMAL_TYPES,
  ANIMAL_INTERACTION_TYPES,
  VALID_PERCHES,
  requiresLocation,
  requiresObject,
  requiresObjectInteraction,
  requiresAnimal,
  requiresAnimalInteraction,
  requiresDescription,
} from '../../constants';

const bundle = adaptConfig(bundledConfig);

describe('adaptConfig — parity with the hardcoded constants (stage D gate)', () => {
  it('exposes the same active behaviors with identical labels and groups', () => {
    const constantValues = BEHAVIORS.filter((b) => b.value !== '').map(
      (b) => b.value
    );
    const bundleValues = bundle.BEHAVIORS.filter((b) => b.value !== '').map(
      (b) => b.value
    );

    expect(bundleValues.sort()).toEqual([...constantValues].sort());

    BEHAVIORS.filter((b) => b.value !== '').forEach((expected) => {
      const actual = bundle.BEHAVIORS.find((b) => b.value === expected.value);
      expect(actual.label).toBe(expected.label);
      expect(actual.group).toBe(expected.group);
    });
  });

  it('agrees with every requires* helper for every behavior value', () => {
    const helpers = {
      requiresLocation,
      requiresObject,
      requiresObjectInteraction,
      requiresAnimal,
      requiresAnimalInteraction,
      requiresDescription,
    };

    BEHAVIORS.filter((b) => b.value !== '').forEach(({ value }) => {
      Object.entries(helpers).forEach(([name, constantHelper]) => {
        expect(`${value}.${name}=${bundle[name](value)}`).toBe(
          `${value}.${name}=${constantHelper(value)}`
        );
      });
    });
  });

  it('produces identical grouped behavior menus', () => {
    const strip = (groups) =>
      groups.map(({ group, options }) => ({
        group,
        options: options.map((o) => ({ value: o.value, label: o.label })),
      }));

    expect(strip(bundle.getGroupedBehaviors())).toEqual(
      strip(getGroupedBehaviors())
    );
    expect(bundle.BEHAVIOR_GROUP_ORDER).toEqual(BEHAVIOR_GROUP_ORDER);
  });

  it('produces identical option lists for all four vocabularies', () => {
    expect(bundle.INANIMATE_OBJECTS).toEqual(INANIMATE_OBJECTS);
    expect(bundle.OBJECT_INTERACTION_TYPES).toEqual(OBJECT_INTERACTION_TYPES);
    expect(bundle.ANIMAL_TYPES).toEqual(ANIMAL_TYPES);
    expect(bundle.ANIMAL_INTERACTION_TYPES).toEqual(ANIMAL_INTERACTION_TYPES);
  });

  it('covers VALID_PERCHES exactly, plus Ground (the seed union)', () => {
    const expected = new Set([...VALID_PERCHES.map(String), 'Ground']);
    expect(new Set(bundle.VALID_PERCHES)).toEqual(expected);
  });

  it('reproduces the inline perch dropdown structure', () => {
    expect(bundle.perchOptions.map((g) => g.label)).toEqual([
      'Common Locations',
      'Perches (1-31)',
      'Baby Boxes',
      'Food Platforms',
      'Other',
    ]);
    expect(bundle.perchOptions[0].options).toEqual([
      { value: 'Ground', label: 'Ground' },
    ]);
    expect(bundle.perchOptions[1].options).toHaveLength(31);
    expect(bundle.perchOptions[1].options[0]).toEqual({
      value: '1',
      label: 'Perch 1',
    });
    expect(bundle.perchOptions[4].options).toEqual([
      { value: 'G', label: 'G - Ground' },
      { value: 'W', label: 'W - Water Bowl' },
    ]);
  });

  it('binds aviary and patient identity from config', () => {
    expect(bundle.aviaryName).toBe("Sayyida's Cove");
    expect(bundle.patientName).toBe('Sayyida');
    expect(bundle.perchDiagrams).toHaveLength(2);
  });
});

describe('adaptConfig — behavior beyond the constants', () => {
  it('derives 23 Excel rows (18 current + 5 legacy) in row order', () => {
    expect(bundle.excelBehaviorRows).toHaveLength(23);
    expect(bundle.excelBehaviorRows[0]).toEqual({
      value: 'eating',
      label: 'Eating (Note Location)',
    });
    expect(bundle.excelBehaviorRows[22]).toEqual({
      value: 'other',
      label: 'Other',
    });
  });

  it('keeps retired behaviors out of menus but resolvable via lookups', () => {
    const menuValues = bundle.BEHAVIORS.map((b) => b.value);
    expect(menuValues).not.toContain('aggression');

    expect(bundle.getBehaviorByValue('aggression')).toMatchObject({
      label: 'Aggression or Defensive Posturing',
    });
    // Legacy flag still drives conditional fields for draft-held values
    expect(bundle.requiresLocation('eating_elsewhere')).toBe(true);
    expect(bundle.requiresLocation('eating_food_platform')).toBe(false);
  });

  it('resolves vocab labels for lookup, including menu entries', () => {
    expect(bundle.lookupVocabLabel('object', 'rubber_duck')).toBe(
      'Rubber Duck'
    );
    expect(bundle.lookupVocabLabel('animal_interaction', 'watching')).toBe(
      'Watching'
    );
    expect(bundle.lookupVocabLabel('object', 'nonexistent')).toBeUndefined();
  });
});
