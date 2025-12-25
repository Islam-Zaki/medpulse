
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

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Forget Password state
  const [showForgetModal, setShowForgetModal] = useState(false);
  const [forgetStep, setForgetStep] = useState<1 | 2>(1); // 1: Email, 2: Token/Reset
  const [forgetEmail, setForgetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleForgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
        await api.forgetPassword(forgetEmail);
        showToast(t({ar: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني', en: 'Reset token sent to your email'}), 'success');
        setForgetStep(2);
    } catch (err) {
        showToast(t({ar: 'فشل إرسال الطلب. تأكد من صحة البريد الإلكتروني.', en: 'Failed to send request. Ensure email is correct.'}), 'error');
    } finally {
        setResetLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
        await api.resetPassword(forgetEmail, resetToken, resetPassword);
        showToast(t({ar: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.', en: 'Password reset successfully. You can log in now.'}), 'success');
        setShowForgetModal(false);
        setForgetStep(1);
        setForgetEmail('');
        setResetToken('');
        setResetPassword('');
    } catch (err) {
        showToast(t({ar: 'فشل إعادة تعيين كلمة المرور. الرمز قد يكون غير صالح.', en: 'Password reset failed. Token might be invalid.'}), 'error');
    } finally {
        setResetLoading(false);
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
              <button 
                type="button" 
                onClick={() => { setShowForgetModal(true); setForgetStep(1); }}
                className="font-medium text-med-sky hover:text-med-blue"
              >
                {t(c.forgotPasswordLink)}
              </button>
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

      {/* Forget Password Modal */}
      {showForgetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
                  <div className="bg-med-tech-blue p-6 text-white flex justify-between items-center">
                      <h3 className="text-xl font-bold font-arabic">
                        {forgetStep === 1 
                            ? t({ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?'}) 
                            : t({ar: 'تعيين كلمة مرور جديدة', en: 'Reset New Password'})
                        }
                      </h3>
                      <button onClick={() => setShowForgetModal(false)} className="text-white/80 hover:text-white text-2xl font-bold">&times;</button>
                  </div>
                  
                  <div className="p-8">
                      {forgetStep === 1 ? (
                          <form onSubmit={handleForgetSubmit} className="space-y-6">
                              <p className="text-gray-600 text-sm leading-relaxed">
                                  {t({
                                      ar: 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمزاً لإعادة تعيين كلمة المرور.',
                                      en: 'Enter your registered email and we will send you a reset token.'
                                  })}
                              </p>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-2">{t({ar: 'البريد الإلكتروني', en: 'Email Address'})}</label>
                                  <input 
                                      type="email" 
                                      required 
                                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-med-tech-blue outline-none bg-gray-50"
                                      placeholder="example@mail.com"
                                      value={forgetEmail}
                                      onChange={e => setForgetEmail(e.target.value)}
                                  />
                              </div>
                              <button 
                                  type="submit" 
                                  disabled={resetLoading}
                                  className="w-full bg-med-tech-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                  {resetLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                  {t({ar: 'إرسال الطلب', en: 'Send Request'})}
                              </button>
                          </form>
                      ) : (
                          <form onSubmit={handleResetSubmit} className="space-y-5">
                              <p className="text-gray-600 text-sm bg-blue-50 p-4 rounded-xl border border-blue-100">
                                  {t({
                                      ar: 'يرجى إدخال الرمز المرسل إلى بريدك مع كلمة المرور الجديدة.',
                                      en: 'Please enter the token sent to your email along with your new password.'
                                  })}
                              </p>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{t({ar: 'البريد الإلكتروني', en: 'Email Address'})}</label>
                                  <input 
                                      type="email" 
                                      required 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-med-tech-blue outline-none bg-gray-100"
                                      value={forgetEmail}
                                      readOnly
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{t({ar: 'الرمز (Token)', en: 'Token'})}</label>
                                  <input 
                                      type="text" 
                                      required 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-med-tech-blue outline-none bg-gray-50"
                                      placeholder="e.g. LHMy8"
                                      value={resetToken}
                                      onChange={e => setResetToken(e.target.value)}
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-gray-700 mb-1">{t({ar: 'كلمة المرور الجديدة', en: 'New Password'})}</label>
                                  <input 
                                      type="password" 
                                      required 
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-med-tech-blue outline-none bg-gray-50"
                                      placeholder="********"
                                      value={resetPassword}
                                      onChange={e => setResetPassword(e.target.value)}
                                  />
                              </div>
                              <button 
                                  type="submit" 
                                  disabled={resetLoading}
                                  className="w-full bg-med-vital-green text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                              >
                                  {resetLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                  {t({ar: 'تأكيد إعادة التعيين', en: 'Confirm Reset'})}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setForgetStep(1)}
                                className="w-full text-sm text-gray-500 hover:text-med-tech-blue transition-colors mt-2 font-medium"
                              >
                                  {t({ar: 'رجوع إلى البريد الإلكتروني', en: 'Back to Email'})}
                              </button>
                          </form>
                      )}
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @keyframes scale-up {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
            animation: scale-up 0.3s ease-out forwards;
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
