import { Navigate, Route, Routes } from 'react-router-dom';
import EditorPage from './EditorPage';
import HomePage from './HomePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor/*" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
