
import React, { useState } from 'react';
import type { NavigateFunction, User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useToast } from '../hooks/useToast';
import { SIGNUP_PAGE_CONTENT } from '../constants';

interface SignUpPageProps {
  navigate: NavigateFunction;
  handleLogin: (user: User) => void;
}

const EyeIcon: React.FC<{ closed?: boolean }> = ({ closed }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {closed ? (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        ) : (
            <>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </>
        )}
    </svg>
);


const SignUpPage: React.FC<SignUpPageProps> = ({ navigate, handleLogin }) => {
  const { t } = useLocalization();
  const { showToast } = useToast();
  const c = SIGNUP_PAGE_CONTENT;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast(t(c.validation.passwordMatch), 'error');
      return;
    }
    if (formData.password.length < 8) {
      showToast(t(c.validation.passwordLength), 'error');
      return;
    }
    
    // Simulate a successful signup and login
    const newUser: User = { id: Date.now(), name: formData.fullName, email: formData.email };
    handleLogin(newUser);
    showToast(t(c.success.title), 'success');
    navigate('home');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-med-blue font-arabic">{t(c.title)}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{t(c.subtitle)}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input name="fullName" type="text" required placeholder={t(c.fields.fullName)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-sky focus:border-med-sky" />
            <input name="email" type="email" required placeholder={t(c.fields.email)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-sky focus:border-med-sky" />
            <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} required placeholder={t(c.fields.password)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-sky focus:border-med-sky" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    <EyeIcon closed={!showPassword} />
                </button>
            </div>
             <div className="relative">
                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required placeholder={t(c.fields.confirmPassword)} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-med-sky focus:border-med-sky" />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    <EyeIcon closed={!showConfirmPassword} />
                </button>
            </div>
          </div>
          
          <div className="flex items-center">
            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-med-sky focus:ring-med-sky border-gray-300 rounded" />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">{t(c.checkboxes.terms)}</label>
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-med-sky hover:bg-med-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-med-sky transition-colors">
              {t(c.button)}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
            <button onClick={() => navigate('login')} className="font-medium text-med-sky hover:text-med-blue">
                {t(c.loginLink)}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
