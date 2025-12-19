
import React, { useState } from 'react';
import type { NavigateFunction, User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { LOGIN_PAGE_CONTENT } from '../constants';
import { api } from '../services/api';

interface LoginPageProps {
  navigate: NavigateFunction;
  handleLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ navigate, handleLogin }) => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const c = LOGIN_PAGE_CONTENT;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await api.login(email, password);
        
        // Save token - Handle potential variations in API response key
        const token = response.access_token || response['access token'] || response.token;
        
        if (token) {
            localStorage.setItem('auth_token', token);

            // Fetch User details to get Role and ID
            // Note: The login response doesn't give full user details, 
            // so in a real app we might need to call /me or decode JWT.
            // For this demo, we mock the user object but use the real token.
            
            const user: User = { 
                id: 1, // This should come from API or decoding token
                name: 'Admin User', 
                email: email,
                token: token
            };
            
            handleLogin(user);
            showToast(t({ar: 'تم تسجيل الدخول بنجاح', en: 'Logged in successfully'}), 'success');
            navigate('home'); // Direct to home page after login
        } else {
            throw new Error('Token not found in response');
        }
    } catch (err) {
        showToast(t({ar: 'فشل تسجيل الدخول. يرجى التحقق من البيانات.', en: 'Login failed. Please check credentials.'}), 'error');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-med-blue font-arabic">{t(c.title)}</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">{t(c.fields.email)}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-med-sky focus:border-med-sky focus:z-10 sm:text-sm bg-white"
                placeholder={t(c.fields.email)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t(c.fields.password)}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-med-sky focus:border-med-sky focus:z-10 sm:text-sm bg-white"
                placeholder={t(c.fields.password)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-med-sky focus:ring-med-sky border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">{t(c.checkbox)}</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-med-sky hover:text-med-blue">{t(c.forgotPasswordLink)}</a>
            </div>
          </div>

          <div>
            <button 
                type="submit" 
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-med-sky hover:bg-med-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-med-sky transition-colors disabled:opacity-70"
            >
              {loading ? t({ar: 'جاري التحميل...', en: 'Loading...'}) : t(c.button)}
            </button>
          </div>
        </form>
         <div className="text-sm text-center">
            <button onClick={() => navigate('home')} className="font-medium text-gray-500 hover:text-gray-700">
                {t({ar: 'تخطي تسجيل الدخول', en: 'Skip Login'})}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
