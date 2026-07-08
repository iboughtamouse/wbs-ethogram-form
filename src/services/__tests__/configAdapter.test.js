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

  it('exposes 55 perch values (50 active + 5 retired) including the retired Ground', () => {
    // VALID_PERCHES is the full set (retired included) for validating draft-held
    // values; the 009 re-catalog is 50 active + 5 retired old-format specials.
    expect(bundle.VALID_PERCHES).toHaveLength(55);
    expect(bundle.VALID_PERCHES).toContain('Ground'); // retired old-format dup, still resolvable
    expect(bundle.VALID_PERCHES).toContain('37'); // added by 009
    expect(bundle.VALID_PERCHES).toContain('W');
  });

  it('reproduces the inline perch dropdown structure', () => {
    // Groups appear in perch sortOrder first-appearance order (009 re-catalog)
    expect(bundle.perchOptions.map((g) => g.label)).toEqual([
      'Perches',
      'Ramps of Wonder',
      'Tiny Hut',
      'Footbridges',
      'Food Platforms',
      'Baby Boxes',
      'Common Locations',
    ]);
    // 'Perches' holds 1-37 in sort order (options are not re-sorted by label)
    expect(bundle.perchOptions[0].options).toHaveLength(37);
    expect(bundle.perchOptions[0].options[0]).toEqual({
      value: '1',
      label: 'High SE Turfed Corner Perch',
    });
    // Common Locations = water bowl + ground (active ground is value 'G', relabelled)
    expect(bundle.perchOptions.at(-1).options).toEqual([
      { value: 'W', label: 'Water Bowl' },
      { value: 'G', label: 'Ground' },
    ]);
  });

  it('binds aviary and subject identity from config', () => {
    expect(bundle.aviaryName).toBe("Sayyida's Cove");
    expect(bundle.aviarySlug).toBe('sayyidas-cove');
    expect(bundle.aviaryOptions).toEqual([
      { slug: 'sayyidas-cove', name: "Sayyida's Cove" },
    ]);
    expect(bundle.getAviaryDisplayName('sayyidas-cove')).toBe("Sayyida's Cove");
    expect(bundle.fosterParentName).toBe('Sayyida');
    expect(bundle.subjects).toEqual([
      {
        name: 'Sayyida',
        type: 'foster_parent',
        species: 'Barred Owl',
        arrivedOn: '2025-12-15',
        departedOn: null,
      },
      {
        name: '187(B)',
        type: 'juvenile',
        species: 'Barred Owl',
        arrivedOn: '2026-06-01',
        departedOn: null,
      },
      {
        name: '216(O)',
        type: 'juvenile',
        species: 'Barred Owl',
        arrivedOn: '2026-06-01',
        departedOn: null,
      },
      {
        name: '253(R)',
        type: 'juvenile',
        species: 'Barred Owl',
        arrivedOn: '2026-06-01',
        departedOn: null,
      },
    ]);
    expect(bundle.perchDiagrams).toHaveLength(3);
  });
});

describe('adaptConfig — behavior beyond the constants', () => {
  it('derives the full 23-row Excel catalog with enablement flags in row order', () => {
    expect(bundle.excelBehaviorRows).toHaveLength(23);
    expect(bundle.excelBehaviorRows[0]).toEqual({
      value: 'eating',
      label: 'Eating (Note Location)',
      enabled: true,
    });
    expect(bundle.excelBehaviorRows[22]).toEqual({
      value: 'other',
      label: 'Other',
      enabled: true,
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

  it('keeps the full Excel catalog when enablement shrinks, flagging disabled rows', () => {
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

    // Row filtering moved to the generator (enabled ∪ present-in-data); the
    // adapter always emits the full catalog so offline drafts keep their rows
    const rows = adaptConfig(doc).excelBehaviorRows;
    expect(rows).toHaveLength(23);
    const byValue = new Map(rows.map((r) => [r.value, r]));
    expect(byValue.get('eating').enabled).toBe(true);
    expect(byValue.get('aggression').enabled).toBe(false); // retired, not enabled
    expect(byValue.get('flying').enabled).toBe(false); // active but disabled
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

  it('rejects an aviary without a vocabulary block (FU-2: throw, do not degrade)', () => {
    // Pre-FU-2 this adapted to empty menus; a throw lets the provider's
    // recovery keep a working bundle instead of rendering a husk
    const doc = {
      ...bundledConfig,
      aviaries: [{ ...bundledConfig.aviaries[0], vocabulary: undefined }],
    };

    expect(() => adaptConfig(doc)).toThrow('no usable aviary');
  });
});

describe('adaptConfig — aviary selection', () => {
  const northAnnex = {
    ...bundledConfig.aviaries[0],
    slug: 'north-annex',
    name: 'North Annex',
    isActive: true,
    subjects: [
      {
        name: 'Piper',
        type: 'foster_parent',
        species: 'Great Horned Owl',
        arrivedOn: '2025-10-01',
        departedOn: null,
      },
    ],
  };
  const oldMews = {
    ...northAnnex,
    slug: 'old-mews',
    name: 'Old Mews',
    isActive: false,
  };
  const doc = {
    ...bundledConfig,
    aviaries: [bundledConfig.aviaries[0], northAnnex, oldMews],
  };

  it('defaults to the first active aviary when no slug is given', () => {
    const adapted = adaptConfig(doc);
    expect(adapted.aviarySlug).toBe('sayyidas-cove');
    expect(adapted.aviaryName).toBe("Sayyida's Cove");
    expect(adapted.fosterParentName).toBe('Sayyida');
  });

  it('selects the requested active aviary by slug', () => {
    const adapted = adaptConfig(doc, 'north-annex');
    expect(adapted.aviarySlug).toBe('north-annex');
    expect(adapted.aviaryName).toBe('North Annex');
    expect(adapted.fosterParentName).toBe('Piper');
    expect(adapted.subjects.map((s) => s.name)).toEqual(['Piper']);
  });

  it('falls back to the first active aviary for unknown or inactive slugs', () => {
    expect(adaptConfig(doc, 'nonexistent').aviarySlug).toBe('sayyidas-cove');
    expect(adaptConfig(doc, 'old-mews').aviarySlug).toBe('sayyidas-cove');
  });

  it('lists only active aviaries in aviaryOptions', () => {
    expect(adaptConfig(doc).aviaryOptions).toEqual([
      { slug: 'sayyidas-cove', name: "Sayyida's Cove" },
      { slug: 'north-annex', name: 'North Annex' },
    ]);
  });

  it('resolves display names across the full aviary list, echoing unknown slugs', () => {
    const adapted = adaptConfig(doc);
    expect(adapted.getAviaryDisplayName('old-mews')).toBe('Old Mews'); // inactive still resolves
    expect(adapted.getAviaryDisplayName('never-existed')).toBe('never-existed');
  });
});

describe('adaptConfig — getSubjectsPresentOn', () => {
  const doc = {
    ...bundledConfig,
    aviaries: [
      {
        ...bundledConfig.aviaries[0],
        subjects: [
          {
            name: 'Sayyida',
            type: 'foster_parent',
            species: 'Barred Owl',
            arrivedOn: '2025-11-29',
            departedOn: null,
          },
          {
            name: 'Piper',
            type: 'patient',
            species: 'Great Horned Owl',
            arrivedOn: '2025-12-01',
            departedOn: '2026-01-15',
          },
          // Second overlapping episode for Piper — exercises name dedupe
          {
            name: 'Piper',
            type: 'patient',
            species: 'Great Horned Owl',
            arrivedOn: '2026-01-10',
            departedOn: null,
          },
        ],
      },
    ],
  };
  const presentNames = (date) =>
    adaptConfig(doc)
      .getSubjectsPresentOn(date)
      .map((s) => s.name);

  it('includes a subject on its arrival date but not the day before', () => {
    expect(presentNames('2025-11-28')).toEqual([]);
    expect(presentNames('2025-11-29')).toEqual(['Sayyida']);
    expect(presentNames('2025-12-01')).toEqual(['Sayyida', 'Piper']);
  });

  it('treats departedOn as exclusive (present the day before, gone on the day)', () => {
    // Only the first Piper episode matters here: query dates precede episode two
    expect(presentNames('2026-01-09')).toContain('Piper');
    const bounded = {
      ...doc,
      aviaries: [
        {
          ...doc.aviaries[0],
          subjects: doc.aviaries[0].subjects.slice(0, 2),
        },
      ],
    };
    const bothEnds = (date) =>
      adaptConfig(bounded)
        .getSubjectsPresentOn(date)
        .map((s) => s.name);
    expect(bothEnds('2026-01-14')).toEqual(['Sayyida', 'Piper']);
    expect(bothEnds('2026-01-15')).toEqual(['Sayyida']);
  });

  it('dedupes a subject with overlapping episodes by name', () => {
    // 2026-01-12 falls inside both Piper episodes
    expect(presentNames('2026-01-12')).toEqual(['Sayyida', 'Piper']);
  });
});

describe('adaptConfig — unusable documents throw (FU-2)', () => {
  // A throw (rather than silent degradation to empty menus) is what lets
  // the provider's recovery keep the last good bundle / bundled snapshot.
  it('throws for a document with no aviaries', () => {
    expect(() => adaptConfig({ ...bundledConfig, aviaries: [] })).toThrow(
      'no usable aviary'
    );
  });

  it('throws for an aviary without a vocabulary', () => {
    const doc = {
      ...bundledConfig,
      aviaries: [{ ...bundledConfig.aviaries[0], vocabulary: null }],
    };
    expect(() => adaptConfig(doc)).toThrow('no usable aviary');
  });
});
