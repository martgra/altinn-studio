import type { FormComponentType } from '../../types/global';
import { ComponentTypes } from '../index';
import { EditCodeList } from './editModal/EditCodeList';
import { EditDataModelBindings } from './editModal/EditDataModelBindings';
import { EditDescription } from './editModal/EditDescription';
import { EditHeaderSize } from './editModal/EditHeaderSize';
import { EditOptions } from './editModal/EditOptions';
import { EditPreselectedIndex } from './editModal/EditPreselectedIndex';
import { EditReadOnly } from './editModal/EditReadOnly';
import { EditRequired } from './editModal/EditRequired';
import { EditTitle } from './editModal/EditTitle';
import { EditAutoComplete } from './editModal/EditAutoComplete';

export interface IGenericEditComponent {
  component: FormComponentType;
  handleComponentChange: (component: FormComponentType) => void;
  layoutName?: string;
}

export enum EditSettings {
  Title = 'title',
  Description = 'description',
  DataModelBindings = 'dataModelBindings',
  Size = 'size',
  ReadOnly = 'readonly',
  Required = 'required',
  Options = 'options',
  CodeList = 'codelist',
  PreselectedIndex = 'preselectedIndex',
  AutoComplete = 'autocomplete',
}

export const editBoilerPlate = [
  EditSettings.DataModelBindings,
  EditSettings.Title,
  EditSettings.Description,
  EditSettings.ReadOnly,
  EditSettings.Required,
];

export interface IComponentEditConfig {
  [id: string]: EditSettings[];
}

interface IConfigComponents {
  [id: string]: ({ component, handleComponentChange }: IGenericEditComponent) => JSX.Element;
}

export const componentSpecificEditConfig: IComponentEditConfig = {
  [ComponentTypes.Header]: [EditSettings.Title, EditSettings.Size],
  [ComponentTypes.Input]: [...editBoilerPlate, EditSettings.AutoComplete],
  [ComponentTypes.TextArea]: [...editBoilerPlate, EditSettings.AutoComplete],
  [ComponentTypes.Datepicker]: [...editBoilerPlate],
  [ComponentTypes.Paragraph]: [EditSettings.Title],
  [ComponentTypes.AttachmentList]: [EditSettings.Title],
  [ComponentTypes.RadioButtons]: [...editBoilerPlate],
  [ComponentTypes.Checkboxes]: [
    ...editBoilerPlate,
    EditSettings.Options,
    EditSettings.PreselectedIndex,
  ],
  [ComponentTypes.RadioButtons]: [
    ...editBoilerPlate,
    EditSettings.Options,
    EditSettings.PreselectedIndex,
  ],
  [ComponentTypes.Dropdown]: [
    ...editBoilerPlate,
    EditSettings.CodeList,
    EditSettings.PreselectedIndex,
    EditSettings.AutoComplete,
  ],
  [ComponentTypes.AddressComponent]: [EditSettings.Title],
  [ComponentTypes.FileUploadWithTag]: [EditSettings.Title, EditSettings.Description],
  [ComponentTypes.Panel]: [EditSettings.Title],
  [ComponentTypes.Map]: [EditSettings.ReadOnly],
};

export const configComponents: IConfigComponents = {
  [EditSettings.DataModelBindings]: EditDataModelBindings,
  [EditSettings.Size]: EditHeaderSize,
  [EditSettings.Title]: EditTitle,
  [EditSettings.ReadOnly]: EditReadOnly,
  [EditSettings.Required]: EditRequired,
  [EditSettings.Description]: EditDescription,
  [EditSettings.Options]: EditOptions,
  [EditSettings.CodeList]: EditCodeList,
  [EditSettings.PreselectedIndex]: EditPreselectedIndex,
  [EditSettings.AutoComplete]: EditAutoComplete,
};
