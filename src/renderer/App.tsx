import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Installer from './pages/Installer';
import 'tailwindcss/tailwind.css';
import Launcher from './pages/Launcher';
import Header from './components/Header';
import Footer from './components/Footer';

function AppWrapper(props: any) {
  const { showEdit } = props;
  return (
    <div className="text-center flex flex-col h-screen">
      <Header />
      {showEdit ? <Installer /> : <Launcher />}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppWrapper showEdit />} />
        <Route path="/launch" element={<AppWrapper showEdit={false} />} />
      </Routes>
    </Router>
  );
}
