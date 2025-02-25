import type { SagaIterator } from 'redux-saga';
import { call, put, takeLatest } from 'redux-saga/effects';
import { get, post } from 'app-shared/utils/networking';
import { appMetadataPath } from 'app-shared/api-paths';
import { ApplicationMetadataActions } from '../applicationMetadataSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

function* getApplicationMetadataSaga({ payload }: PayloadAction<{ org, app }>): SagaIterator {
  const { org, app } = payload;
  try {
    const result = yield call(get, appMetadataPath(org, app));
    yield put(
      ApplicationMetadataActions.getApplicationMetadataFulfilled({
        applicationMetadata: result,
      })
    );
  } catch (error) {
    if (error.status === 404) {
      // The application metadata does not exist, create one then fetch.
      // This might happen for old services, which does not yet have a metadata file
      const { org, app } = payload;
      yield call(post, appMetadataPath(org, app));
      yield put(ApplicationMetadataActions.getApplicationMetadata());
    } else {
      yield put(ApplicationMetadataActions.getApplicationMetadataRejected({ error }));
    }
  }
}

export function* watchGetApplicationMetadataSaga(): SagaIterator {
  yield takeLatest(ApplicationMetadataActions.getApplicationMetadata, getApplicationMetadataSaga);
}
