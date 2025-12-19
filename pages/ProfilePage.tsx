import React from 'react';
import type { NavigateFunction, User } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PROFILE_PAGE_CONTENT } from '../constants';

interface ProfilePageProps {
  navigate: NavigateFunction;
  user: User;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ navigate, user }) => {
  const { t } = useLocalization();
  const c = PROFILE_PAGE_CONTENT;

  return (
    <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-med-blue font-arabic">{t(c.title)}</h1>
                <p className="mt-4 text-xl text-gray-700">
                    {t(c.welcome)} {user.name}
                </p>
                <p className="mt-2 text-gray-500">{user.email}</p>
            </div>
        </div>
    </div>
  );
};

export default ProfilePage;
