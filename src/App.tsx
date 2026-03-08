import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import NewDocumentPage from '@/pages/NewDocumentPage'
import FillModePage from '@/pages/FillModePage'
import PreviewPage from '@/pages/PreviewPage'
import TemplateEditorPage from '@/pages/TemplateEditorPage'
import TemplateEditorPageV2 from '@/pages/TemplateEditorPageV2'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new/:type" element={<NewDocumentPage />} />
        <Route path="/document/:id" element={<FillModePage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
        {/* Legacy wizard editor — kept for backward compat */}
        <Route path="/template-editor" element={<TemplateEditorPage />} />
        <Route path="/template-editor/:id" element={<TemplateEditorPage />} />
        {/* New grid-based drag-and-drop editor */}
        <Route path="/template-editor-v2" element={<TemplateEditorPageV2 />} />
        <Route path="/template-editor-v2/:id" element={<TemplateEditorPageV2 />} />
      </Routes>
    </BrowserRouter>
  )
}
