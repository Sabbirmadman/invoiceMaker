import { configureStore } from '@reduxjs/toolkit'
import { saveDocuments } from '@/services/storage'
import documentsReducer from './slices/documentsSlice'
import templatesReducer from './slices/templatesSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    templates: templatesReducer,
    ui: uiReducer,
  },
})

// Persist documents to localStorage on every state change
store.subscribe(() => {
  saveDocuments(store.getState().documents.documents)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
