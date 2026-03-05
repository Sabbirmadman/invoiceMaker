import { createSlice } from '@reduxjs/toolkit'
import type { Template } from '@/types/template'
import { classicInvoice } from '@/data/templates/classicInvoice'

interface TemplatesState {
  templates: Template[]
}

const initialState: TemplatesState = {
  templates: [classicInvoice],
}

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {},
})

export default templatesSlice.reducer
