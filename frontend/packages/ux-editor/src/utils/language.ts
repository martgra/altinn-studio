import type { ITextResource } from '../types/global';
import { CollapsableMenus } from '../types/global';
import { ComponentTypes } from '../components';
import i18next from 'i18next';

export function getComponentHelperTextByComponentType(type: string, language: any): string {
  switch (type) {
    case ComponentTypes.Header: {
      return language['ux_editor.helper_text_for_header'];
    }
    case ComponentTypes.Input: {
      return language['ux_editor.helper_text_for_input'];
    }
    case ComponentTypes.Checkboxes: {
      return language['ux_editor.helper_text_for_check_box'];
    }
    case ComponentTypes.RadioButtons: {
      return language['ux_editor.helper_text_for_radio_button'];
    }
    case ComponentTypes.Image: {
      return language['ux_editor.helper_text_for_image'];
    }
    case ComponentTypes.AttachmentList: {
      return language['ux_editor.helper_text_for_attachment_list'];
    }
    case ComponentTypes.Button: {
      return language['ux_editor.helper_text_for_attachment_button'];
    }
    case ComponentTypes.NavigationBar: {
      return language['ux_editor.helper_text_for_nav_bar'];
    }
    default: {
      // Several components does not yet have a helper text, a default is shown.
      return language['ux_editor.helper_text_default'];
    }
  }
}

export function getComponentTitleByComponentType(type: string, t: typeof i18next.t): string {
  switch (type) {
    case ComponentTypes.Checkboxes: {
      return t('ux_editor.component_checkbox');
    }
    case ComponentTypes.Dropdown: {
      return t('ux_editor.component_dropdown');
    }
    case ComponentTypes.FileUpload: {
      return t('ux_editor.component_file_upload');
    }
    case ComponentTypes.FileUploadWithTag: {
      return t('ux_editor.component_file_upload_with_tag');
    }
    case ComponentTypes.Header: {
      return t('ux_editor.component_header');
    }
    case ComponentTypes.Input: {
      return t('ux_editor.component_input');
    }
    case ComponentTypes.Image: {
      return t('ux_editor.component_image');
    }
    case ComponentTypes.Datepicker: {
      return t('ux_editor.component_datepicker');
    }
    case ComponentTypes.Button: {
      return t('ux_editor.component_button');
    }
    case ComponentTypes.TextArea: {
      return t('ux_editor.component_text_area');
    }
    case ComponentTypes.RadioButtons: {
      return t('ux_editor.component_radio_button');
    }
    case ComponentTypes.Paragraph: {
      return t('ux_editor.component_paragraph');
    }
    case ComponentTypes.AddressComponent: {
      return t('ux_editor.component_advanced_address');
    }
    case ComponentTypes.Group: {
      return t('ux_editor.component_group');
    }
    case ComponentTypes.NavigationButtons: {
      return t('ux_editor.component_navigation_buttons');
    }
    case ComponentTypes.AttachmentList: {
      return t('ux_editor.component_attachment_list');
    }
    case ComponentTypes.NavigationBar: {
      return t('ux_editor.component_navigation_bar');
    }
    case ComponentTypes.Panel: {
      return t('ux_editor.component_information_panel');
    }
    case ComponentTypes.Map: {
      return t('ux_editor.component_map');
    }
    default: {
      return '';
    }
  }
}

export function getCollapsableMenuTitleByType(menu: CollapsableMenus, t: typeof i18next.t): string {
  switch (menu) {
    case CollapsableMenus.Components: {
      return t('ux_editor.collapsable_schema_components');
    }
    case CollapsableMenus.Texts: {
      return t('ux_editor.collapsable_text_components');
    }
    case CollapsableMenus.AdvancedComponents: {
      return t('ux_editor.collapsable_text_advanced_components');
    }
    case CollapsableMenus.Widgets: {
      return t('ux_editor.collapsable_text_widgets');
    }
    // case CollapsableMenus.ThirdParty: {
    //   return language['ux_editor.collapsable_text_thirdparty_components'];
    // }
    default: {
      return '';
    }
  }
}

export function truncate(s: string, size: number) {
  if (s && s.length > size) {
    return `${s.substring(0, size)}...`;
  }
  return s;
}

export function getTextResource(resourceKey: string, textResources: ITextResource[]): string {
  const textResource = textResources.find((resource) => resource.id === resourceKey);
  return textResource ? textResource.value : resourceKey;
}
