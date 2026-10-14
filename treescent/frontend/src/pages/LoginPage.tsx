import { LoginForm } from '../components/auth';

export const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-page-inner">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Treescent</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your personal link page, beautifully simple</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};