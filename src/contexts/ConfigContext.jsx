import { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { adaptConfig } from '../services/configAdapter';
import {
  bundledConfig,
  getInitialConfig,
  fetchLatestConfig,
} from '../services/configService';

/**
 * The context default is the adapted bundled snapshot, so components and
 * hooks work without a provider (tests, storybook-style rendering). The
 * provider only adds the cache/fetch upgrade path.
 *
 * Config applies at mount only (Phase 1 design §4): a fetched document
 * replaces the bundle once, when its version is newer. Values are
 * append-only, so an in-progress draft never holds a value a newer config
 * can't resolve.
 */
const ConfigContext = createContext(adaptConfig(bundledConfig));

export const ConfigProvider = ({ children }) => {
  const [bundle, setBundle] = useState(() => adaptConfig(getInitialConfig()));

  useEffect(() => {
    let active = true;

    fetchLatestConfig().then((doc) => {
      if (active && doc) {
        setBundle((current) =>
          doc.version > current.version ? adaptConfig(doc) : current
        );
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ConfigContext.Provider value={bundle}>{children}</ConfigContext.Provider>
  );
};

ConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useConfig = () => useContext(ConfigContext);
