/**
 * Config Adapter
 *
 * Pure adaptation of the published config document (GET /api/config shape,
 * bundled snapshot at src/config/defaultConfig.json) into the bundle the form
 * consumes. The bundle mirrors what src/constants/* used to export, so
 * components keep the same vocabulary and call patterns.
 *
 * Menu data excludes retired / not-enabled entries; the lookup helpers
 * (getBehaviorByValue, lookupVocabLabel) search the FULL catalog so values
 * held by old drafts still resolve to labels and conditional-field flags.
 */

const VOCAB_KEYS = {
  object: 'objects',
  object_interaction: 'objectInteractionTypes',
  animal: 'animals',
  animal_interaction: 'animalInteractionTypes',
};

const PLACEHOLDERS = {
  object: 'Select object...',
  object_interaction: 'Select interaction...',
  animal: 'Select animal...',
  animal_interaction: 'Select interaction...',
};

/**
 * Sort option entries alphabetically by label with 'other' pinned last —
 * the dropdown ordering rule from study feedback #4.
 */
const sortOptions = (options) => {
  const others = options.filter((o) => o.value === 'other');
  const rest = options
    .filter((o) => o.value !== 'other')
    .sort((a, b) => a.label.localeCompare(b.label));
  return [...rest, ...others];
};

/**
 * Adapt a config document into the form's config bundle.
 * @param {Object} doc - Published config document (validated by configService)
 * @returns {Object} - The bundle exposed through useConfig()
 */
export const adaptConfig = (doc) => {
  // Phase 1 is single-aviary: the form binds to the first active aviary.
  const aviary = doc.aviaries.find((a) => a.isActive) ?? doc.aviaries[0];
  const vocabulary = aviary?.vocabulary ?? {};
  const enabled = {
    behaviors: new Set(vocabulary.behaviors ?? []),
    object: new Set(vocabulary.objects ?? []),
    object_interaction: new Set(vocabulary.objectInteractionTypes ?? []),
    animal: new Set(vocabulary.animals ?? []),
    animal_interaction: new Set(vocabulary.animalInteractionTypes ?? []),
  };

  // --- Behaviors ---------------------------------------------------------

  const toBehavior = (b) => ({
    value: b.value,
    label: b.label,
    group: b.group,
    requiresLocation: b.requiresLocation,
    requiresObject: b.requiresObject,
    requiresObjectInteraction: b.requiresObjectInteraction,
    requiresAnimal: b.requiresAnimal,
    requiresAnimalInteraction: b.requiresAnimalInteraction,
    requiresDescription: b.requiresDescription,
  });

  // Full catalog (retired included) — for lookups and validation of draft-held values
  const allBehaviors = doc.behaviors.map(toBehavior);
  const behaviorByValue = new Map(allBehaviors.map((b) => [b.value, b]));

  // Menu data: active (non-retired, enabled) behaviors. The '' placeholder
  // is presentation and lives in BehaviorSelect, not here.
  const BEHAVIORS = doc.behaviors
    .filter((b) => !b.retired && enabled.behaviors.has(b.value))
    .map(toBehavior);

  const BEHAVIOR_GROUP_ORDER = [...doc.behaviorGroups]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((g) => g.name);

  // Precomputed once — the bundle is immutable, and selects render often
  const groupedBehaviors = BEHAVIOR_GROUP_ORDER.map((group) => ({
    group,
    options: BEHAVIORS.filter((b) => b.group === group).sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
  })).filter((g) => g.options.length > 0);

  const getGroupedBehaviors = () => groupedBehaviors;

  const getBehaviorByValue = (value) => behaviorByValue.get(value);

  const flagHelper = (flag) => (behaviorValue) =>
    behaviorByValue.get(behaviorValue)?.[flag] || false;

  // --- Flat vocabulary lists ---------------------------------------------

  const vocabLabelByValue = {};
  const optionList = (kind) => {
    const entries = doc[VOCAB_KEYS[kind]];
    vocabLabelByValue[kind] = new Map(entries.map((o) => [o.value, o.label]));
    const active = entries
      .filter((o) => !o.retired && enabled[kind].has(o.value))
      .map((o) => ({ value: o.value, label: o.label }));
    return [{ value: '', label: PLACEHOLDERS[kind] }, ...sortOptions(active)];
  };

  const INANIMATE_OBJECTS = optionList('object');
  const OBJECT_INTERACTION_TYPES = optionList('object_interaction');
  const ANIMAL_TYPES = optionList('animal');
  const ANIMAL_INTERACTION_TYPES = optionList('animal_interaction');

  const lookupVocabLabel = (kind, value) => vocabLabelByValue[kind]?.get(value);

  // --- Perches ------------------------------------------------------------

  const allPerches = [...(aviary?.perches ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
  const activePerches = allPerches.filter((p) => !p.retired);

  // Validation accepts retired perches too (values are append-only): a
  // draft-held location must stay submittable after the perch is retired.
  // Menus (perchOptions below) show active perches only.
  const VALID_PERCHES = allPerches.map((p) => p.value);

  // Grouped options for the location react-select, groups in first-appearance
  // order (which follows perch sortOrder)
  const perchOptions = [];
  const groupIndex = new Map();
  activePerches.forEach((p) => {
    if (!groupIndex.has(p.group)) {
      groupIndex.set(p.group, perchOptions.length);
      perchOptions.push({ label: p.group, options: [] });
    }
    perchOptions[groupIndex.get(p.group)].options.push({
      value: p.value,
      label: p.label,
    });
  });

  // --- Aviary / subject identity + Excel rows -----------------------------

  const aviaryName = aviary?.name ?? '';
  const patientName =
    (aviary?.subjects ?? []).find(
      (s) => s.type === 'foster_parent' && !s.departedOn
    )?.name ?? '';

  // Same derivation as the backend's behaviorRowsFor(): catalog in
  // excelRowOrder, filtered to the aviary's enablement (retired included —
  // historical drafts may hold legacy values)
  // Enabled rows plus ALL retired rows: a draft can hold a legacy/retired
  // value regardless of current enablement, and its mark must never silently
  // vanish from an offline export. (The backend gets the same guarantee from
  // version stamping instead.)
  const excelBehaviorRows = [...doc.behaviors]
    .filter((b) => b.retired || enabled.behaviors.has(b.value))
    .sort((a, b) => a.excelRowOrder - b.excelRowOrder)
    .map((b) => ({ value: b.value, label: b.excelRowLabel }));

  return {
    version: doc.version,
    BEHAVIORS,
    BEHAVIOR_GROUP_ORDER,
    getGroupedBehaviors,
    getBehaviorByValue,
    requiresLocation: flagHelper('requiresLocation'),
    requiresObject: flagHelper('requiresObject'),
    requiresObjectInteraction: flagHelper('requiresObjectInteraction'),
    requiresAnimal: flagHelper('requiresAnimal'),
    requiresAnimalInteraction: flagHelper('requiresAnimalInteraction'),
    requiresDescription: flagHelper('requiresDescription'),
    INANIMATE_OBJECTS,
    OBJECT_INTERACTION_TYPES,
    ANIMAL_TYPES,
    ANIMAL_INTERACTION_TYPES,
    lookupVocabLabel,
    VALID_PERCHES,
    perchOptions,
    aviaryName,
    patientName,
    perchDiagrams: aviary?.perchDiagrams ?? [],
    excelBehaviorRows,
  };
};
