import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IRepoListProps } from './RepoList';
import * as userApi from '../../services/userApi';
import { RepoList } from './RepoList';
import { mockUseTranslation } from '../../../testing/mocks/i18nMock';

const user = userEvent.setup();

afterEach(() => jest.restoreAllMocks());
jest.mock('../../services/userApi', () => ({
  __esModule: true,
  ...jest.requireActual('../../services/userApi'),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => mockUseTranslation() }));

const repos = [
  {
    name: 'repo name',
    full_name: 'full_name',
    owner: {
      avatar_url: 'avatar_url',
      login: 'login',
      full_name: 'full_name',
    },
    description: 'description',
    is_cloned_to_local: false,
    updated_at: '2021-11-16T07:05:02Z',
    html_url: 'html_url',
    clone_url: 'clone_url',
    id: 1,
    user_has_starred: false,
  },
  {
    name: 'other repo',
    full_name: 'full_name',
    owner: {
      avatar_url: 'avatar_url',
      login: 'login',
      full_name: 'full_name',
    },
    description: 'description',
    is_cloned_to_local: false,
    updated_at: '2021-11-16T07:05:02Z',
    html_url: 'html_url',
    clone_url: 'clone_url',
    id: 2,
    user_has_starred: true,
  },
];

describe('RepoList', () => {
  it('should not call onSortModelChange when clicking sort button and isServerSort is false', async () => {
    const handleSort = jest.fn();
    render({
      onSortModelChange: handleSort,
      isServerSort: false,
    });

    // eslint-disable-next-line testing-library/no-node-access
    const sortBtn = document.querySelector('button[aria-label="Sort"]');
    await user.click(sortBtn);

    expect(handleSort).not.toHaveBeenCalled();
  });

  it('should call onSortModelChange when clicking sort button and isServerSort is true', async () => {
    const handleSort = jest.fn();
    render({
      onSortModelChange: handleSort,
      isServerSort: true,
      rowCount: 5,
    });

    // eslint-disable-next-line testing-library/no-node-access
    const sortBtn = document.querySelector('button[aria-label="Sort"]');
    await user.click(sortBtn);

    expect(handleSort).toHaveBeenCalledWith([{ field: 'name', sort: 'asc' }], {
      reason: undefined,
    });
  });

  it('should call useSetStarredRepoMutation when adding a favorite', async () => {
    const useSetStarredRepoMutationSpy = jest.fn();
    jest
      .spyOn(userApi, 'useSetStarredRepoMutation')
      .mockImplementation(jest.fn().mockReturnValue([useSetStarredRepoMutationSpy]));
    render();

    const favoriteBtn = screen.getByRole('menuitem', {
      name: /dashboard.star/i,
    });
    await user.click(favoriteBtn);

    expect(useSetStarredRepoMutationSpy).toBeCalledWith(repos[0]);
  });

  it('should call useUnsetStarredRepoMutation when removing a favorite', async () => {
    const useUnsetStarredRepoMutationSpy = jest.fn();
    jest
      .spyOn(userApi, 'useUnsetStarredRepoMutation')
      .mockImplementation(jest.fn().mockReturnValue([useUnsetStarredRepoMutationSpy]));
    render();

    const unFavoriteBtn = screen.getByRole('menuitem', {
      name: /dashboard.unstar/i,
    });
    await user.click(unFavoriteBtn);

    expect(useUnsetStarredRepoMutationSpy).toBeCalledWith(repos[1]);
  });

  it('should show gitea icon and edit models icon when displaying a "-datamodels" repo', () => {
    const datamodelsRepo = {
      name: 'test-datamodels',
      full_name: 'test-datamodels',
      owner: {
        avatar_url: 'avatar_url',
        login: 'login',
        full_name: 'full_name',
      },
      description: 'description',
      is_cloned_to_local: false,
      updated_at: '2021-11-16T07:05:02Z',
      html_url: 'html_url',
      clone_url: 'clone_url',
      id: 2,
      user_has_starred: true,
    };
    render({ repos: [datamodelsRepo] });

    expect(screen.getByTestId('gitea-repo-link')).toBeInTheDocument();
    expect(screen.getByTestId('edit-repo-link')).toBeInTheDocument();
  });

  it('should show gitea icon edit app not when displaying a "-datamodels" repo', () => {
    render({ repos: [repos[0]] });

    expect(screen.getByTestId('gitea-repo-link')).toBeInTheDocument();
    expect(screen.getByTestId('edit-repo-link')).toBeInTheDocument();
  });
});

const render = (props: Partial<IRepoListProps> = {}) => {
  const initialState = {
    language: {
      language: {
        dashboard: {
          edit_app: 'Edit app',
          repository: 'Repository',
        },
      },
    },
    designerApi: {},
  };
  const store = configureStore()(initialState);

  const allProps = {
    isLoading: false,
    disableVirtualization: true, // https://github.com/mui-org/material-ui-x/issues/1151
    rowCount: repos.length,
    repos,
    ...props,
  };

  return rtlRender(
    <Provider store={store}>
      <RepoList {...allProps} />
    </Provider>
  );
};
