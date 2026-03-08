import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Template, AnyTemplate } from '@/types/template'
import type { TemplateV2 } from '@/types/templateV2'
import { loadCustomTemplates } from '@/services/storage'

interface TemplatesState {
  customTemplates: AnyTemplate[]
}

const initialState: TemplatesState = {
  customTemplates: loadCustomTemplates() as AnyTemplate[],
}

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    addCustomTemplate(state, action: PayloadAction<AnyTemplate>) {
      state.customTemplates.push(action.payload)
    },
    updateCustomTemplate(state, action: PayloadAction<AnyTemplate>) {
      const idx = state.customTemplates.findIndex((t) => t.id === action.payload.id)
      if (idx !== -1) state.customTemplates[idx] = action.payload
    },
    deleteCustomTemplate(state, action: PayloadAction<string>) {
      state.customTemplates = state.customTemplates.filter((t) => t.id !== action.payload)
    },
    /** Save a TemplateV2 — adds if new, replaces if existing */
    saveTemplateV2(state, action: PayloadAction<TemplateV2>) {
      const idx = state.customTemplates.findIndex((t) => t.id === action.payload.id)
      if (idx !== -1) {
        state.customTemplates[idx] = action.payload
      } else {
        state.customTemplates.push(action.payload)
      }
    },
  },
})

export const { addCustomTemplate, updateCustomTemplate, deleteCustomTemplate, saveTemplateV2 } = templatesSlice.actions

export default templatesSlice.reducer
