import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import type { GroupedOption, ISchemaSelectProps } from './SchemaSelect';
import { SchemaSelect } from './SchemaSelect';

describe('SchemaSelect', () => {
  const mockOptions: GroupedOption[] = [
    {
      label: 'JSONSchema',
      options: [
        {
          label: 'test123',
          value: {
            fileName: 'test123.schema.json',
            repositoryRelativeUrl: 'model/test123.schema.json',
            fileType: '.json',
          },
        },
      ],
    },
    {
      label: 'XSD',
      options: [
        {
          label: 'my-test-xsd',
          value: {
            fileName: 'my-test-xsd.xsd',
            repositoryRelativeUrl: 'model/my-test-xsd.xsd',
            fileType: '.xsd',
          },
        },
      ],
    },
  ];

  it('should render empty select when there are no provided options', () => {
    render();
    const selectComponent = screen.getByRole('combobox');
    expect(selectComponent.getAttribute('value')).toBe('');
  });

  it('should not select any item when there are provided options but no selected item provided', async () => {
    render({ options: mockOptions });
    const selectedOptionText = screen.queryByText('test123');
    expect(selectedOptionText).toBeNull();
  });

  it('should select provided selected item when there are provided options', async () => {
    render({
      options: mockOptions,
      selectedOption: {
        label: 'test123',
        value: {
          fileName: 'test123.schema.json',
          repositoryRelativeUrl: 'model/test123.schema.json',
          fileType: '.json',
        },
      },
    });
    const selectedOptionText = screen.getByText('test123');
    expect(selectedOptionText).toBeVisible();
  });
});

const render = (props?: Partial<ISchemaSelectProps>) => {
  const defaultProps: ISchemaSelectProps = {
    disabled: false,
    onChange: jest.fn,
    options: [
      {
        label: 'JSONSchema',
        options: [],
      },
      {
        label: 'XSD',
        options: [],
      },
    ],
    selectedOption: null,
  };

  return rtlRender(<SchemaSelect {...defaultProps} {...props} />);
};
