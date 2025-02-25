import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IJsonSchema, ISchemaState } from '../../types';
import type { UiSchemaNode, CombinationKind, FieldType } from '@altinn/schema-model';
import {
  buildJsonSchema,
  buildUiSchema,
  castRestrictionType,
  convertPropToType,
  createNodeBase,
  getNodeByPointer,
  getParentNodeByPointer,
  getUniqueNodePath,
  Keywords,
  makePointer,
  ObjectKind,
  pointerIsDefinition,
  removeNodeByPointer,
  renameNodePointer,
  replaceLastPointerSegment,
  ROOT_POINTER,
  splitPointerInBaseAndName,
} from '@altinn/schema-model';
import { swapArrayElements } from 'app-shared/pure';
import type { Dict } from '../../../../schema-model/src/lib/types';

export const initialState: ISchemaState = {
  schema: {},
  uiSchema: [],
  name: '/',
  saveSchemaUrl: '',
  selectedPropertyNodeId: '',
  selectedDefinitionNodeId: '',
  focusNameField: '',
  selectedEditorTab: 'properties',
};

const schemaEditorSlice = createSlice({
  name: 'schemaEditor',
  initialState,
  reducers: {
    addEnum(state, action: PayloadAction<{ path: string; value: string; oldValue?: string }>) {
      const { path, value, oldValue } = action.payload;
      const addToItem = getNodeByPointer(state.uiSchema, path);
      addToItem.enum = addToItem.enum ?? [];
      if (oldValue === null || oldValue === undefined) {
        addToItem.enum.push(value);
      }
      if (addToItem.enum.includes(oldValue)) {
        addToItem.enum[addToItem.enum.indexOf(oldValue)] = value;
      }
      if (!addToItem.enum.includes(value)) {
        addToItem.enum.push(value);
      }
    },
    addRootItem(
      state,
      action: PayloadAction<{
        location: string;
        name: string;
        props: Partial<UiSchemaNode>;
      }>
    ) {
      const { location, name, props } = action.payload;
      const newPointer = getUniqueNodePath(state.uiSchema, [location, name].join('/'));
      const newNode = createNodeBase(newPointer);
      newNode.implicitType = false;
      state.uiSchema.push(Object.assign(newNode, props));
      getNodeByPointer(state.uiSchema, ROOT_POINTER).children.push(newPointer);
      if (pointerIsDefinition(newPointer)) {
        state.selectedDefinitionNodeId = newPointer;
      } else {
        state.selectedPropertyNodeId = newPointer;
      }
      state.focusNameField = newPointer;
    },
    addProperty(
      state,
      action: PayloadAction<{
        pointer: string;
        keepSelection?: boolean;
        props: Partial<UiSchemaNode>;
      }>
    ) {
      const { pointer, keepSelection, props } = action.payload;
      const addToNode = getNodeByPointer(state.uiSchema, pointer);
      const pointerBase = addToNode.isArray
        ? makePointer(addToNode.pointer, Keywords.Items)
        : addToNode.pointer;
      const newNodePointer = getUniqueNodePath(
        state.uiSchema,
        makePointer(pointerBase, Keywords.Properties, 'name')
      );
      addToNode.children.push(newNodePointer);
      if (!keepSelection) {
        if (state.selectedEditorTab === 'definitions') {
          state.selectedDefinitionNodeId = newNodePointer;
        } else {
          state.selectedPropertyNodeId = newNodePointer;
        }
        state.focusNameField = newNodePointer;
      }
      props.implicitType = false;
      state.uiSchema.push(Object.assign(createNodeBase(newNodePointer), props));
    },
    deleteEnum(state, action: PayloadAction<{ path: string; value: string }>) {
      const { path, value } = action.payload;
      const removeFromItem = getNodeByPointer(state.uiSchema, path);
      const removeIndex = removeFromItem.enum?.findIndex((v: any) => v === value) ?? -1;
      if (removeIndex >= 0) {
        removeFromItem.enum?.splice(removeIndex, 1);
      }
    },
    promoteProperty(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload;
      state.uiSchema = convertPropToType(state.uiSchema, path);
    },
    deleteProperty(state, action: PayloadAction<{ path: string }>) {
      const { path } = action.payload;
      state.uiSchema = removeNodeByPointer(state.uiSchema, path);
      if (state.selectedDefinitionNodeId === path) {
        state.selectedDefinitionNodeId = '';
      } else if (state.selectedPropertyNodeId === path) {
        state.selectedPropertyNodeId = '';
      }
    },
    deleteCombinationItem(state, action: PayloadAction<{ path: string }>) {
      // removing a "combination" array item (foo.anyOf[i]), could be oneOf, allOf, anyOf
      const { path } = action.payload;

      if (state.selectedDefinitionNodeId === path) {
        state.selectedDefinitionNodeId = '';
      }
      if (state.selectedPropertyNodeId === path) {
        state.selectedPropertyNodeId = '';
      }
      state.uiSchema = removeNodeByPointer(state.uiSchema, path);
    },
    setRestriction(state, action: PayloadAction<{ path: string; key: string; value?: string }>) {
      const { path, value, key } = action.payload;
      const schemaItem = getNodeByPointer(state.uiSchema, path);
      const restrictions = { ...schemaItem.restrictions };
      restrictions[key] = castRestrictionType(key, value);
      Object.keys(restrictions).forEach((k) => {
        if (restrictions[k] === undefined) {
          delete restrictions[k];
        }
      });
      schemaItem.restrictions = restrictions;
    },
    setRestrictions(state, action: PayloadAction<{ path: string; restrictions: Dict }>) {
      const { path, restrictions } = action.payload;
      const schemaItem = getNodeByPointer(state.uiSchema, path);
      const schemaItemRestrictions = { ...schemaItem.restrictions };
      Object.keys(restrictions).forEach((key) => {
        schemaItemRestrictions[key] = castRestrictionType(key, restrictions[key]);
      });
      Object.keys(schemaItemRestrictions).forEach((k) => {
        if (schemaItemRestrictions[k] === undefined) {
          delete schemaItemRestrictions[k];
        }
      });
      schemaItem.restrictions = schemaItemRestrictions;
    },
    setRef(state, action: PayloadAction<{ path: string; ref: string }>) {
      const { path, ref } = action.payload;
      const referredNode = getNodeByPointer(state.uiSchema, ref);
      const uiSchemaNode = getNodeByPointer(state.uiSchema, path);
      uiSchemaNode.reference = ref;
      uiSchemaNode.objectKind = ObjectKind.Reference;
      uiSchemaNode.fieldType = referredNode.fieldType;
      uiSchemaNode.implicitType = true;
    },
    setType(state, action: PayloadAction<{ path: string; type: FieldType }>) {
      const { path, type } = action.payload;
      const uiSchemaNode = getNodeByPointer(state.uiSchema, path);
      uiSchemaNode.reference = undefined;
      uiSchemaNode.children = [];
      uiSchemaNode.fieldType = type;
      uiSchemaNode.implicitType = false;
    },
    setTitle(state, action: PayloadAction<{ path: string; title: string }>) {
      const { path, title } = action.payload;
      getNodeByPointer(state.uiSchema, path).title = title;
    },
    setDescription(state, action: PayloadAction<{ path: string; description: string }>) {
      const { path, description } = action.payload;
      getNodeByPointer(state.uiSchema, path).description = description;
    },
    setRequired(state, action: PayloadAction<{ path: string; required: boolean }>) {
      const { path, required } = action.payload;
      getNodeByPointer(state.uiSchema, path).isRequired = required;
    },
    setCombinationType(state, action: PayloadAction<{ type: CombinationKind; path: string }>) {
      const { type, path } = action.payload;
      const uiSchemaNode = getNodeByPointer(state.uiSchema, path);
      const oldPointer = [path, uiSchemaNode.fieldType].join('/');
      const newPointer = [path, type].join('/');
      uiSchemaNode.fieldType = type;
      state.uiSchema = renameNodePointer(state.uiSchema, oldPointer, newPointer);
    },
    addCombinationItem(
      state,
      action: PayloadAction<{ pointer: string; props: Partial<UiSchemaNode> }>
    ) {
      const { pointer, props } = action.payload;
      const addToNode = getNodeByPointer(state.uiSchema, pointer);
      const item = Object.assign(
        createNodeBase(pointer, addToNode.fieldType, addToNode.children.length.toString()),
        props
      );
      item.isCombinationItem = true;
      addToNode.children.push(item.pointer);
      state.uiSchema.push(item);
      state.selectedEditorTab === 'definitions'
        ? (state.selectedDefinitionNodeId = item.pointer)
        : (state.selectedPropertyNodeId = item.pointer);
    },
    setJsonSchema(state, action) {
      const { schema } = action.payload;
      state.schema = schema;
    },
    setPropertyName(
      state,
      action: PayloadAction<{ path: string; name: string; navigate?: boolean }>
    ) {
      const { path, navigate, name } = action.payload;
      if (!name || name.length === 0) {
        return;
      }
      const nodeToRename = getNodeByPointer(state.uiSchema, path);
      const oldPointer = nodeToRename.pointer;
      const newPointer = replaceLastPointerSegment(oldPointer, name);
      state.uiSchema = renameNodePointer(state.uiSchema, nodeToRename.pointer, newPointer);
      if (navigate) {
        state.selectedEditorTab === 'definitions'
          ? (state.selectedDefinitionNodeId = newPointer)
          : (state.selectedPropertyNodeId = newPointer);
      }
    },
    setSchemaName(state, action: PayloadAction<{ name: string }>) {
      const { name } = action.payload;
      state.name = name;
    },
    setSaveSchemaUrl(state, action: PayloadAction<{ saveUrl: string }>) {
      const { saveUrl } = action.payload;
      state.saveSchemaUrl = saveUrl;
    },
    setSelectedId(state, action: PayloadAction<{ pointer: string; focusName?: string }>) {
      const { pointer, focusName } = action.payload;
      state.focusNameField = focusName;
      const key =
        state.selectedEditorTab === 'definitions'
          ? 'selectedDefinitionNodeId'
          : 'selectedPropertyNodeId';
      Object.assign(state, {
        [key]: pointer,
      });
    },
    setUiSchema(state, action: PayloadAction<{ name: string }>) {
      const { name } = action.payload;
      state.uiSchema = buildUiSchema(state.schema);
      state.name = name;
      state.focusNameField = ROOT_POINTER;
      state.selectedDefinitionNodeId = ROOT_POINTER;
      state.selectedPropertyNodeId = ROOT_POINTER;
    },
    updateJsonSchema(state, action: PayloadAction<{ onSaveSchema?: (payload: any) => void }>) {
      const { onSaveSchema } = action.payload;
      const updatedSchema: IJsonSchema = buildJsonSchema(state.uiSchema);
      state.schema = updatedSchema;
      if (onSaveSchema) {
        onSaveSchema(updatedSchema);
      }
    },
    setSelectedTab(state, action: PayloadAction<{ selectedTab: 'definitions' | 'properties' }>) {
      const { selectedTab } = action.payload;
      state.selectedEditorTab = selectedTab;
    },
    navigateToType(state, action: PayloadAction<{ pointer?: string }>) {
      const { pointer } = action.payload;
      if (pointer) {
        Object.assign(state, {
          selectedEditorTab: 'definitions',
          selectedDefinitionNodeId: pointer,
        });
      }
    },
    toggleArrayField(state, action: PayloadAction<{ pointer: string }>) {
      const { pointer } = action.payload;
      const node = getNodeByPointer(state.uiSchema, pointer);
      node.isArray = !node.isArray;
    },
    changeChildrenOrder(state, action: PayloadAction<{ pointerA: string; pointerB: string }>) {
      const { pointerA, pointerB } = action.payload;
      const { base: baseA } = splitPointerInBaseAndName(pointerA);
      const { base: baseB } = splitPointerInBaseAndName(pointerB);
      if (baseA !== baseB) {
        return;
      }
      const parentNode = getParentNodeByPointer(state.uiSchema, pointerA);
      if (parentNode) {
        parentNode.children = swapArrayElements(parentNode.children, pointerA, pointerB);
      }
    },
  },
});

export const { reducer } = schemaEditorSlice;

export const {
  addCombinationItem,
  addEnum,
  addProperty,
  addRootItem,
  changeChildrenOrder,
  deleteCombinationItem,
  deleteEnum,
  deleteProperty,
  navigateToType,
  promoteProperty,
  setCombinationType,
  setDescription,
  setJsonSchema,
  setPropertyName,
  setRef,
  setRequired,
  setRestriction,
  setRestrictions,
  setSaveSchemaUrl,
  setSchemaName,
  setSelectedId,
  setSelectedTab,
  setTitle,
  setType,
  setUiSchema,
  toggleArrayField,
  updateJsonSchema,
} = schemaEditorSlice.actions;

export const SchemaEditorActions = schemaEditorSlice.actions;
