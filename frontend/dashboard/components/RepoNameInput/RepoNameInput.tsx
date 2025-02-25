import React, { useLayoutEffect, useRef } from 'react';
import { AltinnPopper } from 'app-shared/components/AltinnPopper';
import { TextField } from '@digdir/design-system-react';
import { useTranslation } from 'react-i18next';

interface IRepoNameInputProps {
  repoName: string;
  errorMessage?: string;
  onRepoNameChanged: (newValue: string) => void;
}

export const RepoNameInput = ({
  repoName,
  onRepoNameChanged,
  errorMessage,
}: IRepoNameInputProps) => {
  const serviceNameRef = useRef(null);
  const { t } = useTranslation();
  useLayoutEffect(() => {
    serviceNameRef.current = document.querySelector('#service-saved-name');
  });
  const handleChange = ({ target }: { target: HTMLInputElement }) =>
    onRepoNameChanged(target.value);

  return (
    <div>
      <TextField
        id='service-saved-name'
        label={t('general.service_name')}
        value={repoName}
        onChange={handleChange}
      />
      <p>
        {t('dashboard.service_saved_name_description')}{' '}
        <strong style={{ fontWeight: '500' }}>
          {t('dashboard.service_saved_name_description_cannot_be_changed')}
        </strong>
      </p>
      {errorMessage && (
        <AltinnPopper
          anchorEl={serviceNameRef.current}
          message={errorMessage}
          styleObj={{
            zIndex: 1300,
          }}
        />
      )}
    </div>
  );
};
