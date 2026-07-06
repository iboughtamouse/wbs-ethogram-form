/**
 * Config adapter tests. The stage-D parity suite (adapter vs the old
 * hardcoded constants) was retired in stage E along with the constants it
 * compared against; absolute assertions on the bundled snapshot remain.
 */

import { adaptConfig } from '../configAdapter';
import { bundledConfig } from '../configService';

const bundle = adaptConfig(bundledConfig);

describe('adaptConfig — bundled snapshot', () => {
  it('exposes 18 active behaviors in six groups', () => {
    expect(bundle.BEHAVIORS).toHaveLength(18);
    expect(bundle.BEHAVIOR_GROUP_ORDER).toEqual([
      'Feeding',
      'Locomotion',
      'Resting',
      'Maintenance',
      'Social & Environmental',
      'Other',
    ]);
    expect(bundle.requiresLocation('eating')).toBe(true);
    expect(bundle.requiresDescription('other')).toBe(true);
    expect(bundle.requiresObject('interacting_object')).toBe(true);
  });

  it('builds option lists with placeholders first and other pinned last', () => {
    expect(bundle.INANIMATE_OBJECTS[0]).toEqual({
      value: '',
      label: 'Select object...',
    });
    expect(bundle.INANIMATE_OBJECTS.at(-1).value).toBe('other');
    expect(bundle.INANIMATE_OBJECTS).toHaveLength(11);
    expect(bundle.OBJECT_INTERACTION_TYPES).toHaveLength(7);
    expect(bundle.ANIMAL_TYPES).toHaveLength(10);
    expect(bundle.ANIMAL_INTERACTION_TYPES).toHaveLength(12);
  });

  it('exposes 38 perch values including Ground', () => {
    expect(bundle.VALID_PERCHES).toHaveLength(38);
    expect(bundle.VALID_PERCHES).toContain('Ground');
    expect(bundle.VALID_PERCHES).toContain('31');
    expect(bundle.VALID_PERCHES).toContain('W');
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

  it('keeps retired Excel rows even when dropped from enablement (offline drafts)', () => {
    const doc = {
      ...bundledConfig,
      aviaries: [
        {
          ...bundledConfig.aviaries[0],
          vocabulary: {
            ...bundledConfig.aviaries[0].vocabulary,
            // Aviary disables everything except one behavior
            behaviors: ['eating'],
          },
        },
      ],
    };

    const rows = adaptConfig(doc).excelBehaviorRows.map((r) => r.value);
    expect(rows).toContain('eating');
    expect(rows).toContain('aggression'); // retired, not enabled - still a row
    expect(rows).not.toContain('flying'); // active but disabled - no row
  });

  it('keeps retired perches valid for validation but out of menus', () => {
    const doc = {
      ...bundledConfig,
      aviaries: [
        {
          ...bundledConfig.aviaries[0],
          perches: [
            {
              value: '1',
              label: 'Perch 1',
              group: 'Perches',
              sortOrder: 1,
              retired: false,
            },
            {
              value: 'BB1',
              label: 'BB1',
              group: 'Baby Boxes',
              sortOrder: 2,
              retired: true,
            },
          ],
        },
      ],
    };

    const adapted = adaptConfig(doc);
    expect(adapted.VALID_PERCHES).toEqual(['1', 'BB1']);
    expect(
      adapted.perchOptions.flatMap((g) => g.options.map((o) => o.value))
    ).toEqual(['1']);
  });

  it('tolerates an aviary without a vocabulary block (empty menus, no crash)', () => {
    const doc = {
      ...bundledConfig,
      aviaries: [{ ...bundledConfig.aviaries[0], vocabulary: undefined }],
    };

    const adapted = adaptConfig(doc);
    expect(adapted.BEHAVIORS).toHaveLength(0);
    expect(adapted.INANIMATE_OBJECTS).toHaveLength(1);
  });
});
