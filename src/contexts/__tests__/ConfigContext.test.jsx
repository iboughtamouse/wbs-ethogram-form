import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from '../ConfigContext';
import { bundledConfig } from '../../services/configService';

jest.mock('../../services/configService', () => {
  const actual = jest.requireActual('../../services/configService');
  return {
    ...actual,
    fetchLatestConfig: jest.fn(),
  };
});

import { fetchLatestConfig } from '../../services/configService';

const ShowConfig = () => {
  const { version, aviaryName } = useConfig();
  return (
    <div>
      <span data-testid="version">{version}</span>
      <span data-testid="aviary">{aviaryName}</span>
    </div>
  );
};

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('ConfigContext', () => {
  it('provides the bundled snapshot as the no-provider default', () => {
    render(<ShowConfig />);
    expect(screen.getByTestId('version')).toHaveTextContent(
      String(bundledConfig.version)
    );
    expect(screen.getByTestId('aviary')).toHaveTextContent("Sayyida's Cove");
  });

  it('renders immediately from the snapshot and upgrades when a newer version arrives', async () => {
    const newer = {
      ...bundledConfig,
      version: bundledConfig.version + 1,
      aviaries: [
        { ...bundledConfig.aviaries[0], name: "Sayyida's Cove (updated)" },
      ],
    };
    fetchLatestConfig.mockResolvedValue(newer);

    render(
      <ConfigProvider>
        <ShowConfig />
      </ConfigProvider>
    );

    // First paint: bundled snapshot, no waiting on the network
    expect(screen.getByTestId('version')).toHaveTextContent(
      String(bundledConfig.version)
    );

    await waitFor(() =>
      expect(screen.getByTestId('version')).toHaveTextContent(
        String(bundledConfig.version + 1)
      )
    );
    expect(screen.getByTestId('aviary')).toHaveTextContent(
      "Sayyida's Cove (updated)"
    );
  });

  it('keeps the current bundle when the fetched version is not newer', async () => {
    fetchLatestConfig.mockResolvedValue({ ...bundledConfig });

    render(
      <ConfigProvider>
        <ShowConfig />
      </ConfigProvider>
    );

    await waitFor(() => expect(fetchLatestConfig).toHaveBeenCalled());
    expect(screen.getByTestId('version')).toHaveTextContent(
      String(bundledConfig.version)
    );
  });

  it('keeps the current bundle when a fetched doc breaks adaptation', async () => {
    // Shape-valid (passes isValidConfigDoc) but poisonous to adaptConfig
    fetchLatestConfig.mockResolvedValue({
      ...bundledConfig,
      version: bundledConfig.version + 1,
      behaviors: [null],
    });

    render(
      <ConfigProvider>
        <ShowConfig />
      </ConfigProvider>
    );

    await waitFor(() => expect(fetchLatestConfig).toHaveBeenCalled());
    expect(screen.getByTestId('version')).toHaveTextContent(
      String(bundledConfig.version)
    );
    expect(screen.getByTestId('aviary')).toHaveTextContent("Sayyida's Cove");
  });

  it('keeps the snapshot when the fetch fails (offline)', async () => {
    fetchLatestConfig.mockResolvedValue(null);

    render(
      <ConfigProvider>
        <ShowConfig />
      </ConfigProvider>
    );

    await waitFor(() => expect(fetchLatestConfig).toHaveBeenCalled());
    expect(screen.getByTestId('version')).toHaveTextContent(
      String(bundledConfig.version)
    );
    expect(screen.getByTestId('aviary')).toHaveTextContent("Sayyida's Cove");
  });
});
