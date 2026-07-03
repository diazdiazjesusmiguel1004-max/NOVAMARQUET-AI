import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, Mail, Phone, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import BrandLogo from '../components/BrandLogo';

const Register = ({ notificationHandler }) => {
  const navigate = useNavigate();
  const { register, isAuthenticated, authLoading, user } = useStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim() || !formData.first_name.trim() || !formData.last_name.trim()) {
      notificationHandler('Por favor complete todos los campos obligatorios.', 'error');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      notificationHandler('Las contraseñas no coinciden.', 'error');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      notificationHandler('¡Registro completado! Ahora puedes iniciar sesión.', 'success');
      navigate('/login');
    } else {
      notificationHandler(res.error || 'No se pudo completar el registro.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-6 py-8 bg-white border border-slate-200 rounded shadow-sm">
      
      {/* Logo banner */}
      <div className="text-center mb-8 flex flex-col items-center justify-center">
        <div className="mb-4">
          <BrandLogo size="lg" darkText={true} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Crear Cuenta</h2>
        <p className="text-xs text-slate-500 mt-1">Regístrate en NOVAMARQUET-AI y comienza tu experiencia de compra.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name and Lastname */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre</label>
            <input
              type="text"
              name="first_name"
              placeholder="Juan"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Apellido</label>
            <input
              type="text"
              name="last_name"
              placeholder="Pérez"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nombre de Usuario</label>
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder="juan_perez"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
            <User className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Correo Electrónico</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="juan@correo.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
            <Mail className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Teléfono Móvil</label>
          <div className="relative">
            <input
              type="text"
              name="phone"
              placeholder="+51 987 654 321"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
            <Phone className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contraseña</label>
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
            <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirmar Contraseña</label>
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded px-4 py-2.5 pl-10 text-xs text-slate-800 outline-none focus:border-[#007185] focus:bg-white transition-all font-semibold"
            />
            <Lock className="absolute left-3.5 top-3 text-slate-400" size={14} />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-3 bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] border border-[#a88734] hover:bg-[#ddb347] hover:from-[#f5c75a] hover:to-[#ebbc3d] text-slate-900 font-bold text-xs rounded shadow transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
        >
          {authLoading ? 'Registrando...' : 'Crear Cuenta'} <ArrowRight size={14} />
        </button>

      </form>

      {/* Redirect Login footer */}
      <div className="text-center mt-6 text-xs text-slate-500">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="text-[#007185] hover:underline font-bold">
          Inicia Sesión aquí
        </Link>
      </div>

    </div>
  );
};

export default Register;
