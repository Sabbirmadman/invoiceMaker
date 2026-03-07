import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Template } from '@/types/template'
import { loadCustomTemplates } from '@/services/storage'

interface TemplatesState {
  customTemplates: Template[]
}

const initialState: TemplatesState = {
  customTemplates: loadCustomTemplates(),
}

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addCustomTemplate(state, action: PayloadAction<Template>) {
      state.customTemplates.push(action.payload)
    },
    updateCustomTemplate(state, action: PayloadAction<Template>) {
      const idx = state.customTemplates.findIndex((t) => t.id === action.payload.id)
      if (idx !== -1) state.customTemplates[idx] = action.payload
    },
    deleteCustomTemplate(state, action: PayloadAction<string>) {
      state.customTemplates = state.customTemplates.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addCustomTemplate, updateCustomTemplate, deleteCustomTemplate } = templatesSlice.actions

export default templatesSlice.reducer
