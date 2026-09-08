import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Apply from './pages/Apply.jsx'
import ForParents from './pages/ForParents.jsx'
import Proof from './pages/Proof.jsx'
import Why from './pages/Why.jsx'
import WhatIsClaudeCode from './pages/WhatIsClaudeCode.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import Refund from './pages/Refund.jsx'
import NotFound from './pages/NotFound.jsx'

/** Every route in one place. Paths match src/seo/pages.js one to one. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="apply" element={<Apply />} />
        <Route path="for-parents" element={<ForParents />} />
        <Route path="proof" element={<Proof />} />
        <Route path="why" element={<Why />} />
        <Route path="what-is-claude-code" element={<WhatIsClaudeCode />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="refund" element={<Refund />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
