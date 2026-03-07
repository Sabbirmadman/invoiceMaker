import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import NewDocumentPage from '@/pages/NewDocumentPage'
import FillModePage from '@/pages/FillModePage'
import PreviewPage from '@/pages/PreviewPage'
import TemplateEditorPage from '@/pages/TemplateEditorPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new/:type" element={<NewDocumentPage />} />
        <Route path="/document/:id" element={<FillModePage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
        <Route path="/template-editor" element={<TemplateEditorPage />} />
        <Route path="/template-editor/:id" element={<TemplateEditorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
