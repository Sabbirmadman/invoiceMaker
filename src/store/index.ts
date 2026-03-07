import { configureStore } from '@reduxjs/toolkit'
import { saveDocuments, saveCustomTemplates } from '@/services/storage'
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

// Persist documents and custom templates to localStorage on every state change
store.subscribe(() => {
  const state = store.getState()
  saveDocuments(state.documents.documents)
  saveCustomTemplates(state.templates.customTemplates)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const selectAllTemplates = (state: RootState) => [
  ...state.templates.templates,
  ...state.templates.customTemplates,
]
export const selectCustomTemplates = (state: RootState) => state.templates.customTemplates
