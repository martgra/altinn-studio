/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Action, PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { IJsonSchema } from '@altinn/schema-editor/types';
import type { IDataModelsMetadataState } from './metadata';
import type { IMetadataOption } from '../functions/types';

export interface IDataModelAction {
  payload: IDataModelActionPayload;
  type: string;
}
export interface IDataModelActionPayload {
  relativePath?: string;
  name?: string;
  schema?: IJsonSchema;
  repoType?: string;
  metadata?: IMetadataOption;
  org: string;
  app: string;
}

export interface IDataModelErrorActionPayload extends Action {
  error: Error;
}

export interface ISetDataModelFilePathActionPayload extends Action {
  filePath: string;
}
export interface IDataModellingState {
  schema: IJsonSchema;
  error: Error;
  saving: boolean;
  metadata?: IDataModelsMetadataState;
}

export interface IDeleteDataModelRejected {
  error: any;
}

const initialState: IDataModellingState = {
  schema: null,
  error: null,
  saving: false,
};

const dataModellingSlice = createSlice({
  name: 'dataModelling',
  initialState,
  reducers: {
    fetchDataModel(state, { payload }) {
      const modelPath = payload?.metadata?.value?.repositoryRelativeUrl;
      if (!(modelPath && state?.schema?.$id?.endsWith(modelPath))) {
        state.schema = null;
      }
    },
    fetchDataModelFulfilled(state, action) {
      const { schema } = action.payload;
      state.schema = schema;
      state.error = null;
    },
    fetchDataModelRejected(state, action) {
      const { error } = action.payload;
      state.error = error;
    },
    saveDataModel(state, _) {
      state.saving = true;
    },
    saveDataModelFulfilled(state) {
      state.saving = false;
    },
    saveDataModelRejected(state, action) {
      const { error } = action.payload;
      state.saving = false;
      state.error = error;
    },
    createDataModel(state, _) {
      state.error = null;
      state.schema = undefined;
      state.saving = true;
    },
    createDataModelFulfilled(state, { payload }) {
      state.schema = payload.schema;
      state.saving = false;
    },
    createDataModelRejected(state, { payload }) {
      const { error } = payload;
      state.saving = undefined;
      state.error = error;
    },
    deleteDataModel(state, action: PayloadAction<{metadata, org, app}>) {
      state.saving = true;
    },
    deleteDataModelFulfilled(state) {
      state.schema = undefined;
      state.saving = false;
    },
    deleteDataModelRejected(state, action: PayloadAction<IDeleteDataModelRejected>) {
      state.error = action.payload.error;
      state.saving = false;
    },
  },
});

export const {
  fetchDataModel,
  fetchDataModelFulfilled,
  fetchDataModelRejected,
  saveDataModel,
  saveDataModelFulfilled,
  saveDataModelRejected,
  createDataModel,
  createDataModelFulfilled,
  createDataModelRejected,
  deleteDataModel,
  deleteDataModelFulfilled,
  deleteDataModelRejected,
} = dataModellingSlice.actions;

export default dataModellingSlice.reducer;
