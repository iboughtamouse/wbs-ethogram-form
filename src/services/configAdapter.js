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
 * @param {string|null} selectedAviarySlug - Aviary the observer picked; falls
 *   back to the first active aviary (today's single-aviary behavior)
 * @returns {Object} - The bundle exposed through useConfig()
 */
export const adaptConfig = (doc, selectedAviarySlug = null) => {
  const activeAviaries = doc.aviaries.filter((a) => a.isActive);
  const aviary =
    (selectedAviarySlug &&
      activeAviaries.find((a) => a.slug === selectedAviarySlug)) ||
    activeAviaries[0] ||
    doc.aviaries[0];

  // A shape-valid document with no usable aviary must throw rather than
  // silently degrade to empty menus (followups FU-2) — the provider's
  // recovery then keeps the last good bundle / bundled snapshot instead.
  if (!aviary || !aviary.vocabulary) {
    throw new Error('Config document has no usable aviary');
  }
  const vocabulary = aviary.vocabulary;
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
  const aviarySlug = aviary?.slug ?? '';

  // Active aviaries for the metadata picker (with one aviary this renders
  // read-only — today's UX)
  const aviaryOptions = activeAviaries.map((a) => ({
    slug: a.slug,
    name: a.name,
  }));

  // Slug → display name across the FULL aviary list, so historical drafts
  // referencing a since-deactivated aviary still render its name
  const aviaryNameBySlug = new Map(doc.aviaries.map((a) => [a.slug, a.name]));
  const getAviaryDisplayName = (slug) => aviaryNameBySlug.get(slug) ?? slug;

  const subjects = (aviary?.subjects ?? []).map((s) => ({
    name: s.name,
    type: s.type,
    species: s.species,
    arrivedOn: s.arrivedOn,
    departedOn: s.departedOn ?? null,
  }));

  // Residency episodes are half-open [arrivedOn, departedOn): a subject is
  // present on its arrival date, not on its departure date. Deduped by name
  // (a bird with multiple episodes appears once). ISO date strings compare
  // lexicographically, so string comparison is correct here.
  const getSubjectsPresentOn = (date) => {
    const seen = new Set();
    return subjects.filter((s) => {
      const present =
        s.arrivedOn <= date && (!s.departedOn || s.departedOn > date);
      if (!present || seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    });
  };

  const fosterParentName =
    subjects.find((s) => s.type === 'foster_parent' && !s.departedOn)?.name ??
    '';

  // Full catalog in excelRowOrder, carrying the aviary's enablement flag.
  // The generator includes a row iff it is enabled OR its value is present
  // in the data being exported — the same rule as the backend's
  // behaviorRowsFor() (Phase 2 §4 row-filter alignment).
  const excelBehaviorRows = [...doc.behaviors]
    .sort((a, b) => a.excelRowOrder - b.excelRowOrder)
    .map((b) => ({
      value: b.value,
      label: b.excelRowLabel,
      enabled: enabled.behaviors.has(b.value),
    }));

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
    aviarySlug,
    aviaryOptions,
    getAviaryDisplayName,
    subjects,
    getSubjectsPresentOn,
    fosterParentName,
    perchDiagrams: aviary?.perchDiagrams ?? [],
    excelBehaviorRows,
  };
};
