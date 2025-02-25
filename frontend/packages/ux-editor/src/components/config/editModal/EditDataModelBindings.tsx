import { useSelector } from 'react-redux';
import type { IAppState } from '../../../types/global';
import type { IGenericEditComponent } from '../componentConfig';
import { getMinOccursFromDataModel, getXsdDataTypeFromDataModel } from '../../../utils/datamodel';
import { ComponentTypes } from '../../index';
import React from 'react';
import { useText } from '../../../hooks';
import { SelectDataModelComponent } from '../SelectDataModelComponent';
import { Label } from 'app-shared/components/Label';

export interface EditDataModelBindingsProps extends IGenericEditComponent {
  renderOptions?: {
    label?: string;
    returnValue?: any;
    key?: string;
    uniqueKey?: any;
  };
}

export const EditDataModelBindings = ({
  component,
  handleComponentChange,
  renderOptions,
}: EditDataModelBindingsProps) => {
  const dataModel = useSelector((state: IAppState) => state.appData.dataModel.model);
  const t = useText();

  const handleDataModelChange = (selectedDataModelElement: string, key = 'simpleBinding') => {
    handleComponentChange({
      ...component,
      dataModelBindings: {
        ...component.dataModelBindings,
        [key]: selectedDataModelElement,
      },
      required: getMinOccursFromDataModel(selectedDataModelElement, dataModel) > 0,
      timeStamp:
        component.type === ComponentTypes.Datepicker
          ? getXsdDataTypeFromDataModel(selectedDataModelElement, dataModel) === 'DateTime'
          : undefined,
    });
  };

  const { uniqueKey, key, label } = renderOptions || {};
  return (
     <div key={uniqueKey || ''}>
      <Label htmlFor={`selectDataModelSelect-${label}`}>
        {
          label
            ? `${t('ux_editor.modal_properties_data_model_helper')} ${t('general.for')} ${label}`
            : t('ux_editor.modal_properties_data_model_helper')
        }
      </Label>
      <SelectDataModelComponent
        inputId={`selectDataModelSelect-${label}`}
        selectedElement={component.dataModelBindings[key || 'simpleBinding']}
        onDataModelChange={(dataModelField: string) => handleDataModelChange(dataModelField, key)}
        noOptionsMessage={t('general.no_options')}
      />
    </div>
  )
};
