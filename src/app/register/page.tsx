'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterForm() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const [hasRedirected, setHasRedirected] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, hasRedirected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setRedirectCountdown(0);
    setIsRegistering(true);
    
    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsRegistering(false);
      return;
    }

    // Validar contraseña fuerte: mínimo 8 caracteres, letras y números
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números.');
      setIsRegistering(false);
      return;
    }

    // Validar email de dominio permitido
    if (!/^([\w.-]+)@(gmail|hotmail|outlook|yahoo)\.com$/i.test(formData.email)) {
      setError('Solo se permiten correos de Gmail, Hotmail, Outlook o Yahoo.');
      setIsRegistering(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setIsRegistering(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Por favor, introduce un email válido.');
      setIsRegistering(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.reactivated) {
          // Caso especial: cuenta reactivada - autenticar automáticamente
          const success = await register(formData.name, formData.email, formData.password);
          
          if (success) {
            setSuccessMessage('¡Cuenta reactivada exitosamente! Tu cuenta anterior ha sido restaurada con la nueva contraseña.');
            // Redirigir al usuario a donde venía o al home
            setTimeout(() => {
              router.push(redirectTo);
            }, 2000);
          }
        } else {
          // Registro normal - mostrar mensaje y redirigir al login
          setSuccessMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión con tus credenciales.');
          
          // Limpiar el formulario
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          
          // Iniciar countdown de 5 segundos
          setRedirectCountdown(5);
          const countdownInterval = setInterval(() => {
            setRedirectCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                router.push(`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        // Manejar errores específicos
        if (response.status === 409 || data.error === 'Este email ya está registrado') {
          setError('Este email ya está en uso. Si es tu cuenta, intenta iniciar sesión.');
        } else {
          setError(data.error || 'Error al crear la cuenta. Intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b8a089] mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando...</p>
          </div>
        </div>
      </div>
    );
  }

  // No renderizar si ya está autenticado (evita flash)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Crear cuenta</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            <div>{successMessage}</div>
            {redirectCountdown > 0 && (
              <div className="mt-2 text-sm">
                Redirigiendo al login en {redirectCountdown} segundos...
                <div className="mt-2">
                  <Link 
                    href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                    className="text-[#b8a089] hover:text-[#a38b73] font-medium underline"
                  >
                    O haz clic aquí para ir ahora
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ opacity: redirectCountdown > 0 ? 0.6 : 1 }}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={redirectCountdown > 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={redirectCountdown > 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={redirectCountdown > 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={redirectCountdown > 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b8a089] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="new-password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isRegistering || redirectCountdown > 0}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${(isRegistering || redirectCountdown > 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#b8a089] hover:bg-[#a38b73]'}`}
          >
            {isRegistering ? 'Creando cuenta...' : redirectCountdown > 0 ? 'Cuenta creada' : 'Crear cuenta'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link 
              href={`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
              className="text-[#b8a089] hover:text-[#a38b73] font-medium"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}