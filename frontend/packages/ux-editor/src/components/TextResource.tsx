import React, { useState } from 'react';
import { Button, ButtonColor, ButtonVariant, Select, SingleSelectOption } from '@digdir/design-system-react';
import { Add, Close, Edit, Search } from '@navikt/ds-icons';
import classes from './TextResource.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentEditId,
  upsertTextResources,
} from '../features/appData/textResources/textResourcesSlice';
import { DEFAULT_LANGUAGE } from 'app-shared/constants';
import {
  getAllTextResourceIdsWithTextSelector,
  getCurrentEditId,
  textResourceByLanguageAndIdSelector,
} from '../selectors/textResourceSelectors';
import { generateRandomId } from 'app-shared/utils/generateRandomId';
import { generateTextResourceId } from '../utils/generateId';
import { useText } from '../hooks';
import { prepend } from 'app-shared/utils/arrayUtils';
import cn from 'classnames';
import { useParams } from 'react-router-dom';
import { ITextResource } from '../types/global';

export interface TextResourceProps {
  description?: string;
  handleIdChange: (id: string) => void;
  label?: string;
  placeholder?: string;
  previewMode?: boolean;
  textResourceId?: string;
  generateIdOptions?: GenerateTextResourceIdOptions;
}

export interface GenerateTextResourceIdOptions {
  componentId: string;
  layoutId: string;
  textResourceKey: string;
}

export const generateId = (options?: GenerateTextResourceIdOptions) => {
  if (!options) {
    return generateRandomId(12);
  }
  return generateTextResourceId(options.layoutId, options.componentId, options.textResourceKey);
};

export const TextResource = ({
  description,
  handleIdChange,
  label,
  placeholder,
  previewMode,
  textResourceId,
  generateIdOptions,
}: TextResourceProps) => {
  const dispatch = useDispatch();

  const textResource = useSelector(
    textResourceByLanguageAndIdSelector(DEFAULT_LANGUAGE, textResourceId)
  );
  const textResources = useSelector(getAllTextResourceIdsWithTextSelector(DEFAULT_LANGUAGE));
  const t = useText();
  const [isSearchMode, setIsSearchMode] = useState(false);
  const { org, app } = useParams();
  const addTextResource = (id: string) =>
    dispatch(
      upsertTextResources({
        language: DEFAULT_LANGUAGE,
        textResources: { [id]: '' },
        org,
        app,
      })
    );

  const editId = useSelector(getCurrentEditId);
  const setEditId = (id: string) => dispatch(setCurrentEditId(id));
  const isEditing = textResourceId && editId === textResourceId;

  const handleEditButtonClick = () => {
    if (textResourceId) {
      setEditId(textResourceId);
    } else {
      const id = generateId(generateIdOptions);
      addTextResource(id);
      handleIdChange(id);
      setEditId(id);
    }
  };

  const searchOptions: SingleSelectOption[] = prepend<SingleSelectOption>(
    textResources.map((tr) => ({
      label: tr.id,
      value: tr.id,
      formattedLabel: <TextResourceOption textResource={tr} />,
      keywords: [tr.id, tr.value],
    })),
    { label: t('ux_editor.search_text_resources_none'), value: '' }
  );

  return (
    <span
      className={cn(
        classes.root,
        previewMode && classes.previewMode,
        isEditing && classes.isEditing,
        isSearchMode && classes.isSearching
      )}
    >
      {label && <span className={classes.label}>{label}</span>}
      {description && <span className={classes.description}>{description}</span>}
      {isSearchMode && (
        <span className={classes.searchContainer}>
          <span className={classes.select}>
            <Select
              hideLabel={true}
              label={t('ux_editor.search_text_resources_label')}
              onChange={(id) => handleIdChange(id === '' ? undefined : id)}
              options={searchOptions}
              value={textResource?.id ?? ''}
            />
          </span>
          <Button
            aria-label={t('ux_editor.search_text_resources_close')}
            className={classes.button}
            color={ButtonColor.Secondary}
            icon={<Close />}
            onClick={() => setIsSearchMode(false)}
            title={t('ux_editor.search_text_resources_close')}
            variant={ButtonVariant.Quiet}
          />
        </span>
      )}
      <span className={classes.textResource}>
        {textResource?.value ? (
          <span>{textResource.value}</span>
        ) : (
          <span className={classes.placeholder}>{placeholder}</span>
        )}
        <span className={classes.buttonsWrapper}>
          <span className={classes.buttons}>
            {textResource?.value ? (
              <Button
                aria-label={t('general.edit')}
                className={classes.button}
                color={ButtonColor.Secondary}
                disabled={isEditing}
                icon={<Edit />}
                onClick={handleEditButtonClick}
                title={t('general.edit')}
                variant={ButtonVariant.Quiet}
              />
            ) : (
              <Button
                aria-label={t('general.add')}
                className={classes.button}
                color={ButtonColor.Secondary}
                disabled={isEditing}
                icon={<Add />}
                onClick={handleEditButtonClick}
                title={t('general.add')}
                variant={ButtonVariant.Quiet}
              />
            )}
            <Button
              aria-label={t('general.search')}
              className={classes.button}
              color={ButtonColor.Secondary}
              disabled={isSearchMode}
              icon={<Search />}
              onClick={() => setIsSearchMode(true)}
              title={t('general.search')}
              variant={ButtonVariant.Quiet}
            />
          </span>
        </span>
      </span>
    </span>
  );
};

export interface TextResourceOptionProps {
  textResource: ITextResource;
}

export const TextResourceOption = ({ textResource }: TextResourceOptionProps) => {
  const t = useText();
  return (
    <span className={classes.textOption}>
      <span className={classes.textOptionId}>{textResource.id}</span>
      <span
        className={cn(classes.textOptionValue, !textResource.value && classes.empty)}
      >
        {textResource.value || t('ux_editor.no_text')}
      </span>
    </span>
  );
};
