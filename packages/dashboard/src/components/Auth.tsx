import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';

interface AuthProps {
  user: User | null;
  onAuth: (user: User | null) => void;
}

export const Auth: React.FC<AuthProps> = ({ user, onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCred;
      if (isSignup) {
        userCred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCred = await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth(userCred.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      onAuth(userCred.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onAuth(null);
  };

  if (user) {
    return (
      <div className="auth-logged-in">
        <div>👋 שלום, {user.displayName || user.email}</div>
        <button onClick={handleLogout} className="cta-button" style={{marginTop: 16}}>התנתק</button>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isSignup ? 'הרשמה' : 'התחברות'}</h2>
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <button type="submit" className="cta-button" disabled={loading}>
          {isSignup ? 'הרשמה' : 'התחברות'}
        </button>
        <button type="button" className="cta-button" style={{background: '#4285F4', marginTop: 8}} onClick={handleGoogle} disabled={loading}>
          התחבר עם Google
        </button>
        <div style={{marginTop: 12}}>
          {isSignup ? (
            <span>כבר יש לך חשבון? <button type="button" onClick={() => setIsSignup(false)} style={{color: '#667eea', background: 'none', border: 'none', cursor: 'pointer'}}>התחבר</button></span>
          ) : (
            <span>אין לך חשבון? <button type="button" onClick={() => setIsSignup(true)} style={{color: '#667eea', background: 'none', border: 'none', cursor: 'pointer'}}>הרשם</button></span>
          )}
        </div>
        {error && <div style={{color: 'red', marginTop: 8}}>{error}</div>}
      </form>
    </div>
  );
}; 