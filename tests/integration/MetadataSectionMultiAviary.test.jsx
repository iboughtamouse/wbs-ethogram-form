/**
 * MetadataSection with MULTIPLE active aviaries — the <select> branch of the
 * aviary picker. The sibling MetadataSection suite covers the single-aviary
 * read-only branch (the bundled config has one aviary), so this file mocks
 * useConfig with a two-aviary bundle.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import MetadataSection from '../../src/components/MetadataSection';

const subjects = [
  {
    name: 'Sayyida',
    type: 'foster_parent',
    species: 'Barred Owl',
    arrivedOn: '2025-11-29',
    departedOn: null,
  },
];

jest.mock('../../src/contexts/ConfigContext', () => ({
  useConfig: () => ({
    aviaryOptions: [
      { slug: 'sayyidas-cove', name: "Sayyida's Cove" },
      { slug: 'north-annex', name: 'North Annex' },
    ],
    getAviaryDisplayName: (slug) =>
      ({ 'sayyidas-cove': "Sayyida's Cove", 'north-annex': 'North Annex' })[
        slug
      ] ?? slug,
    getSubjectsPresentOn: () => subjects,
    subjects,
  }),
}));

const metadata = {
  observerName: 'Test Observer',
  date: '2026-01-10',
  startTime: '',
  endTime: '',
  aviary: 'sayyidas-cove',
};

describe('MetadataSection — multi-aviary picker', () => {
  it('renders a select with one option per active aviary, valued by slug', () => {
    render(
      <MetadataSection
        metadata={metadata}
        fieldErrors={{}}
        onChange={() => {}}
      />
    );

    const select = screen.getByLabelText('Aviary');
    expect(select.tagName).toBe('SELECT');
    expect(select.value).toBe('sayyidas-cove');

    const options = Array.from(select.options).map((o) => ({
      value: o.value,
      label: o.textContent,
    }));
    expect(options).toEqual([
      { value: 'sayyidas-cove', label: "Sayyida's Cove" },
      { value: 'north-annex', label: 'North Annex' },
    ]);
  });

  it('reports the selected slug through onChange', () => {
    const onChange = jest.fn();
    render(
      <MetadataSection
        metadata={metadata}
        fieldErrors={{}}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Aviary'), {
      target: { value: 'north-annex' },
    });

    expect(onChange).toHaveBeenCalledWith('aviary', 'north-annex');
  });
});
