import { createSlice } from '@reduxjs/toolkit'
import type { Template } from '@/types/template'
import { classicInvoice } from '@/data/templates/classicInvoice'
import { modernInvoice } from '@/data/templates/modernInvoice'
import { classicEstimate } from '@/data/templates/classicEstimate'
import { simpleReceipt } from '@/data/templates/simpleReceipt'

interface TemplatesState {
  templates: Template[]
}

const initialState: TemplatesState = {
  templates: [classicInvoice, modernInvoice, classicEstimate, simpleReceipt],
}

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {},
})

export default templatesSlice.reducer
