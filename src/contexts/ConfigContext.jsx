import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { adaptConfig } from '../services/configAdapter';
import {
  bundledConfig,
  getInitialConfig,
  fetchLatestConfig,
  evictCachedConfig,
} from '../services/configService';

/**
 * The context default is the adapted bundled snapshot, so components and
 * hooks work without a provider (tests, storybook-style rendering). The
 * provider adds the cache/fetch upgrade path and aviary selection.
 *
 * Config applies at mount only (Phase 1 design §4): a fetched document
 * replaces the bundle once, when its version is newer. Values are
 * append-only, so an in-progress draft never holds a value a newer config
 * can't resolve.
 */
const ConfigContext = createContext({
  ...adaptConfig(bundledConfig),
  selectAviary: () => {},
});

export const ConfigProvider = ({ children }) => {
  // The provider holds the raw document; the bundle is derived below so the
  // observer's aviary selection can re-derive vocabulary without refetching.
  const [doc, setDoc] = useState(() => {
    const candidate = getInitialConfig();
    try {
      // A cached doc can pass the shape check yet still break adaptation.
      // Without this guard (and the eviction) the throw lands in the render
      // path and white-screens every subsequent load until the cache is
      // cleared by hand. The bundled snapshot is always adaptable.
      adaptConfig(candidate);
      return candidate;
    } catch {
      evictCachedConfig();
      return bundledConfig;
    }
  });
  const [selectedAviarySlug, setSelectedAviarySlug] = useState(null);

  useEffect(() => {
    let active = true;

    fetchLatestConfig().then((fetched) => {
      if (active && fetched) {
        setDoc((current) => {
          if (fetched.version <= current.version) return current;
          try {
            // The upgrade is best-effort: a document that passes the shape
            // check but still breaks adaptation must never take down a
            // working form. Keep what we have.
            adaptConfig(fetched);
            return fetched;
          } catch {
            return current;
          }
        });
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      ...adaptConfig(doc, selectedAviarySlug),
      selectAviary: setSelectedAviarySlug,
    }),
    [doc, selectedAviarySlug]
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useConfig = () => useContext(ConfigContext);
