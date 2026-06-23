import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldAlert } from 'lucide-react';
import { useStore } from '../store/useStore';

const Login = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { login, isAuthenticated, authLoading, authError, user } = useStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'seller') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      notificationHandler('Por favor completa todos los campos.', 'warning');
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      notificationHandler('Sesión iniciada correctamente.', 'success');
    } else {
      notificationHandler(res.error || 'Credenciales inválidas.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 py-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl shadow-lg transition-colors duration-300">
      
      {/* Brand logo title inside login */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-primary-500/20 mx-auto text-lg mb-2">
          NM
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Iniciar Sesión</h2>
        <p className="text-xs text-slate-400 mt-1">Accede a NOVAMARQUET-AI para realizar compras seguras.</p>
      </div>

      {/* Form credentials */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nombre de Usuario</label>
          <div className="relative">
            <input
              type="text"
              placeholder="admin, seller, client..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <User className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Contraseña</label>
          <div className="relative">
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Action Button submit */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg hover:shadow-primary-500/20 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-1.5 mt-6"
        >
          {authLoading ? 'Verificando...' : 'Entrar'} <ArrowRight size={14} />
        </button>

      </form>

      {/* Seeding note helpers */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-dark-800/80 text-[10px] text-slate-400 leading-relaxed text-center space-y-1 bg-slate-50 dark:bg-dark-955 p-3.5 rounded-2xl">
        <p className="font-bold flex items-center gap-1 justify-center text-slate-500"><ShieldAlert size={12} /> Cuentas Sembradas de Prueba:</p>
        <p>• admin / admin123 (Administrador)</p>
        <p>• seller / seller123 (Vendedor)</p>
        <p>• client / client123 (Cliente)</p>
      </div>

      {/* Redirect register link footer */}
      <div className="text-center mt-6 text-xs text-slate-400">
        ¿No tienes una cuenta?{' '}
        <Link to="/register" className="text-primary-500 hover:underline font-bold">
          Regístrate aquí
        </Link>
      </div>

    </div>
  );
};

export default Login;
