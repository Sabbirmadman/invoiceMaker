import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Template } from '@/types/template'
import { loadCustomTemplates } from '@/services/storage'
import { classicInvoice } from '@/data/templates/classicInvoice'
import { modernInvoice } from '@/data/templates/modernInvoice'
import { classicEstimate } from '@/data/templates/classicEstimate'
import { simpleReceipt } from '@/data/templates/simpleReceipt'
import { proformaInvoice } from '@/data/templates/proformaInvoice'
import { minimalInvoice } from '@/data/templates/minimalInvoice'
import { boldHeaderInvoice } from '@/data/templates/boldHeaderInvoice'
import { corporateInvoice } from '@/data/templates/corporateInvoice'
import { warmInvoice } from '@/data/templates/warmInvoice'

interface TemplatesState {
  templates: Template[]       // built-in (read-only)
  customTemplates: Template[] // user-created (persisted to localStorage)
}

const initialState: TemplatesState = {
  templates: [
    classicInvoice,
    modernInvoice,
    classicEstimate,
    simpleReceipt,
    proformaInvoice,
    minimalInvoice,
    boldHeaderInvoice,
    corporateInvoice,
    warmInvoice,
  ],
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
