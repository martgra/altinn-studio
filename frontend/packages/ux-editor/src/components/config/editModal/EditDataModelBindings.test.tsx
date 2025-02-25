import React from 'react';
import { screen } from '@testing-library/react';

import { appDataMock, dataModelItemMock, dataModelStateMock, renderWithMockStore, textResourcesMock } from '../../../testing/mocks';
import { IAppDataState } from '../../../features/appData/appDataReducers';
import { EditDataModelBindings } from './EditDataModelBindings';
import { mockUseTranslation } from '../../../../../../testing/mocks/i18nMock';

jest.mock(
  'react-i18next',
  () => ({ useTranslation: () => mockUseTranslation() }),
);

const render = ({ dataModelBindings = {}, handleComponentChange = jest.fn() } = {}) => {
  const appData: IAppDataState = {
    ...appDataMock,
    textResources: {
      ...textResourcesMock,
    },
    dataModel: {
      ...dataModelStateMock,
      model: [
        {
          ...dataModelItemMock,
          dataBindingName: 'testModel.field1',
        },
        {
          ...dataModelItemMock,
          dataBindingName: 'testModel.field2',
        },
      ]
    }
  }
  renderWithMockStore({ appData })(
    <EditDataModelBindings
      handleComponentChange={handleComponentChange}
      component={{
        id: 'someComponentId',
        type: 'Input',
        textResourceBindings: {
          title: 'ServiceName',
        },
        dataModelBindings,
      }}
      renderOptions={{
        uniqueKey: 'someComponentId-datamodel-select'
      }}
    />,
  );
};

describe('EditDataModelBindings', () => {
  it('should show select with no selected option by default', () => {
    render();
    expect(screen.getByText('ux_editor.modal_properties_data_model_helper')).toBeInTheDocument();
    expect(screen.getByRole('combobox').getAttribute('value')).toEqual("");
  });

  it('should show select with provided data model binding', () => {
    render({ dataModelBindings: {
      simpleBinding: 'testModel.field1',
    } });
    expect(screen.getByText('ux_editor.modal_properties_data_model_helper')).toBeInTheDocument();
    expect(screen.getByText('testModel.field1')).toBeInTheDocument();
  })
});
