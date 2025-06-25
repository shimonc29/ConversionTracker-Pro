import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { auth } from './firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import './styles.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{textAlign: 'center', marginTop: 100}}>טוען...</div>;

  if (!user) {
    return <Auth user={null} onAuth={setUser} />;
  }

  return <Dashboard user={user} />;
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 