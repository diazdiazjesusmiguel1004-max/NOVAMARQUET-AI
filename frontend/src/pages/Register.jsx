import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import BrandLogo from '../components/BrandLogo';

const Register = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { register, authLoading } = useStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.first_name.trim()) {
      notificationHandler('Por favor completa todos los campos requeridos.', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      notificationHandler('Las contraseñas no coinciden.', 'error');
      return;
    }

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      password: formData.password,
    };

    const res = await register(payload);
    if (res.success) {
      notificationHandler('Usuario registrado exitosamente. Inicie sesión.', 'success');
      navigate('/login');
    } else {
      notificationHandler(res.error || 'No se pudo completar el registro.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 py-8 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-850 rounded-3xl shadow-lg transition-colors duration-300">
      
      {/* Logo banner */}
      <div className="text-center mb-8 flex flex-col items-center justify-center">
        <div className="mb-4">
          <BrandLogo size="lg" darkText={true} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Crear Cuenta</h2>
        <p className="text-xs text-slate-400 mt-1">Regístrate en NOVAMARQUET-AI y comienza tu experiencia de compra.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name and Lastname */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nombre</label>
            <input
              type="text"
              name="first_name"
              placeholder="Juan"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-205 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Apellido</label>
            <input
              type="text"
              name="last_name"
              placeholder="Pérez"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-slate-205 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nombre de Usuario</label>
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="juan_perez"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <User className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Correo Electrónico</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="juan@correo.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-955 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <Mail className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Teléfono Móvil</label>
          <div className="relative">
            <input
              type="text"
              name="phone"
              placeholder="+51 987 654 321"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-955 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <Phone className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Contraseña</label>
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-955 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Confirmar Contraseña</label>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-dark-955 border border-slate-200 dark:border-dark-800 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-850 dark:text-slate-200 outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
            <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-600 hover:shadow-lg hover:shadow-primary-500/20 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-1.5 mt-6"
        >
          {authLoading ? 'Registrando...' : 'Crear Cuenta'} <ArrowRight size={14} />
        </button>

      </form>

      {/* Redirect Login footer */}
      <div className="text-center mt-6 text-xs text-slate-400">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-primary-500 hover:underline font-bold">
          Inicia Sesión aquí
        </Link>
      </div>

    </div>
  );
};

export default Register;
