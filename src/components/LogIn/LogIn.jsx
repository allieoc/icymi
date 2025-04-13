import { useState } from "react";
import { supabase } from '../../utils/supabaseClient';
import { Link } from "react-router-dom";
import "./LogIn.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      setErrorMsg("Login failed. Check your email and password.");
    } else {
      console.log("Logged in user:", data.user);
      navigate("/"); // 👈 redirect to homepage
    }
  
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-indigo-500 to-indigo-900 text-white px-4">
  <form
    onSubmit={handleLogin} // or handleSignup
    className="w-full max-w-sm bg-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-4"
  >
    <h2 className="text-2xl font-bold text-white text-center">Log In</h2>

    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Email"
      required
      className="p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
    />

    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Password"
      required
      className="p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
    />

    {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

    <button
      type="submit"
      disabled={loading}
      className="bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-2 rounded"
    >
      {loading ? "Logging in..." : "Log In"}
    </button>

    <p className="text-sm text-center text-zinc-400">
      Don’t have an account?{" "}
      <Link to="/signup" className="text-blue-400 underline">
        Sign up
      </Link>
    </p>
  </form>
</div>
  );
}
