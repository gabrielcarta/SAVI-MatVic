import React from 'react'

export const Login = () => {
  //const [formData, setFormData] = useState({ email: "", password: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // ...aquí va tu lógica de autenticación...
  }
  return (
    <main className="bg-steel-blue-100 text-steel-blue-600 p-4 rounded">
      <section className="w-full max-w-md space-y-6 rounded-2xl border border-primary/20 bg-primary/5 p-8 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-semibold text-primary text-center">Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-primary/80">
            Correo
            <input
              name="email"
              type="email"
              placeholder="usuario@correo.com"
              className="mt-1 w-full rounded-lg border border-primary/40 bg-secondary/10 px-4 py-2 text-secondary focus:border-secondary focus:ring-2 focus:ring-primary/40 focus:outline-none transition placeholder:text-secondary/60"
              /*value={formData.email}
              onChange={handleChange}
              required*/
            />
          </label>
          <label className="block text-sm font-medium text-primary/80">
            Contraseña
            <input
              name="password"
              type="password"
              placeholder="**********"
              className="mt-1 w-full rounded-lg border border-primary/40 bg-secondary/10 px-4 py-2 text-secondary focus:border-secondary focus:ring-2 focus:ring-primary/40 focus:outline-none transition placeholder:text-secondary/60"
              /*value={formData.password}
              onChange={handleChange}
              required*/
            />
          </label>
          <button
            type="button"
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-secondary/40"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  )
}
