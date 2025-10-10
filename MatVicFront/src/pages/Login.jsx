import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('https://matvicback.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Login exitoso:', data);
        onLoginSuccess();
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-pickled-bluewood-700">
      <div className="bg-pickled-bluewood-100 p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-pickled-bluewood-800">Iniciar Sesión</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="username" className="block mb-2 text-pickled-bluewood-700 font-medium">
              Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 focus:border-transparent transition"
              placeholder="admin"
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-pickled-bluewood-700 font-medium">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600 focus:border-transparent transition"
              placeholder="admin123"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pickled-bluewood-600 text-white py-3 rounded-lg font-semibold hover:bg-pickled-bluewood-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
