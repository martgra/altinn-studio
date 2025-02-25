import React from 'react';
import { CloneModal } from './CloneModal';
import type { ICloneModalProps } from './CloneModal';
import { render as rtlRender, screen } from '@testing-library/react';
import { mockUseTranslation } from '../../../../testing/mocks/i18nMock';

// Mocks:
jest.mock(
  'react-i18next',
  () => ({ useTranslation: () => mockUseTranslation() }),
);

describe('cloneModal', () => {
  it('should show copy link if copy feature is supported', () => {
    document.queryCommandSupported = jest.fn(() => {
      return true;
    });
    render();

    expect(
      screen.getByRole('button', {
        name: /sync_header\.clone_https_button/i,
      })
    ).toBeInTheDocument();
  });

  it('should NOT show copy link if copy feature is NOT supported', () => {
    document.queryCommandSupported = jest.fn(() => {
      return false;
    });
    render();

    expect(
      screen.queryByRole('button', {
        name: /sync_header\.clone_https_button/i,
      })
    ).not.toBeInTheDocument();
  });
});

const render = (props: Partial<ICloneModalProps> = {}) => {
  const allProps = {
     // eslint-disable-next-line testing-library/no-node-access
    anchorEl: document.querySelector('body'),
    onClose: jest.fn(),
    open: true,
    language: {},
    ...props,
  };

  return rtlRender(<CloneModal {...allProps} />);
};
