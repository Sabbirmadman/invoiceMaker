import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppMode } from '@/types/common'

interface UIState {
  mode: AppMode
  activeDocumentId: string | null
  zoom: number
}

const initialState: UIState = {
  mode: 'fill',
  activeDocumentId: null,
  zoom: 1,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<AppMode>) {
      state.mode = action.payload
    },
    setActiveDocument(state, action: PayloadAction<string | null>) {
      state.activeDocumentId = action.payload
    },
    setZoom(state, action: PayloadAction<number>) {
      state.zoom = Math.max(0.25, Math.min(2, action.payload))
    },
  },
})

export const { setMode, setActiveDocument, setZoom } = uiSlice.actions
export default uiSlice.reducer
