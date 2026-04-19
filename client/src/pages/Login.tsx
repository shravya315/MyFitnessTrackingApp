import { AtSignIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppContext } from "../context/AppContext"

const Login = () => {

  const [state, setState] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login, signup, user } = useAppContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) return
    if (state === 'signup' && !username) return

    setIsSubmitting(true)

    try {
      if (state === 'login') {
        await login({ email, password })
      } else {
        await signup({ username, email, password })
      }
    } catch (error) {
      console.log(error)
    }

    setIsSubmitting(false)
  }

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <main className="login-page-container">
      <form onSubmit={handleSubmit} className="login-form">

        <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
          {state === 'login' ? "Sign In" : "Sign Up"}
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {state === 'login'
            ? 'Please enter email and password to access.'
            : 'Please enter your details to create an account'}
        </p>

        {state === 'signup' && (
          <div className="mt-4">
            <label className="text-sm">Username</label>
            <div className="relative mt-2">
              <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="login-input"
                required
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="text-sm">Email</label>
          <div className="relative mt-2">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="login-input"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm">Password</label>
          <div className="relative mt-2">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              className="login-input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="login-button">
          {isSubmitting ? "Loading..." : state === 'login' ? "Login" : "Sign Up"}
        </button>

        {state === 'login' ? (
          <p className="text-center mt-4 text-sm">
            Don't have an account?
            <button onClick={() => setState('signup')} className="ml-1 text-green-600">
              Sign up
            </button>
          </p>
        ) : (
          <p className="text-center mt-4 text-sm">
            Already have an account?
            <button onClick={() => setState('login')} className="ml-1 text-green-600">
              Login
            </button>
          </p>
        )}

      </form>
    </main>
  )
}

export default Login