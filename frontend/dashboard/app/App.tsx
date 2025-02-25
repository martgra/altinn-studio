import React, { useEffect, useState } from 'react';
import './App.css';
import classes from './App.module.css';
import type { IHeaderContext } from 'app-shared/navigation/main-header/Header';
import type { SelectedContext } from '../resources/fetchDashboardResources/dashboardSlice';
import { AltinnSpinner } from 'app-shared/components';
import { Button } from '@digdir/design-system-react';
import { CenterContainer } from '../components/CenterContainer';
import { CreateService } from '../pages/CreateService';
import { Dashboard } from '../pages/Dashboard';
import { DashboardActions } from '../resources/fetchDashboardResources/dashboardSlice';
import { DataModellingContainer } from '../pages/DataModelling';
import { Route, Routes } from 'react-router-dom';
import { post } from 'app-shared/utils/networking';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { useGetOrganizationsQuery } from '../services/organizationApi';
import { userHasAccessToSelectedContext } from '../utils/userUtils';
import AppHeader, {
  HeaderContext,
  SelectedContextType
} from 'app-shared/navigation/main-header/Header';
import {
  userCurrentPath,
  userLogoutAfterPath,
  userLogoutPath,
  userReposPath
} from 'app-shared/api-paths';
import { useTranslation } from 'react-i18next';

export const App = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.dashboard.user);
  const selectedContext = useAppSelector((state) => state.dashboard.selectedContext);
  const { data: orgs = [], isLoading: isLoadingOrganizations } = useGetOrganizationsQuery();
  const { t } = useTranslation();

  const setSelectedContext = (newSelectedContext: SelectedContext) =>
    dispatch(
      DashboardActions.setSelectedContext({
        selectedContext: newSelectedContext
      })
    );

  if (!isLoadingOrganizations && !userHasAccessToSelectedContext({ selectedContext, orgs })) {
    setSelectedContext(SelectedContextType.Self);
  }

  const headerContextValue: IHeaderContext = {
    selectableOrgs: orgs,
    selectedContext,
    setSelectedContext,
    user
  };

  useEffect(() => {
    dispatch(DashboardActions.fetchCurrentUser({ url: userCurrentPath() }));
    dispatch(DashboardActions.fetchServices({ url: userReposPath() }));
  }, [dispatch]);

  const [showLogOutButton, setShowLogoutButton] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setShowLogoutButton(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [user]);

  return user && !isLoadingOrganizations ? (
    <div className={classes.root}>
      <HeaderContext.Provider value={headerContextValue}>
        <AppHeader />
      </HeaderContext.Provider>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/datamodelling/:org/:repoName' element={<DataModellingContainer />} />
        <Route path='/new' element={<CreateService />} />
      </Routes>
    </div>
  ) : (
    <CenterContainer>
      <AltinnSpinner spinnerText={t('dashboard.loading')} />
      {showLogOutButton && (
        <Button
          onClick={() =>
            post(userLogoutPath()).then(() => window.location.assign(userLogoutAfterPath()))
          }
        >
          {t('dashboard.logout')}
        </Button>
      )}
    </CenterContainer>
  );
};
