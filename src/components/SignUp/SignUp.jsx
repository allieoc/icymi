import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { createProfile } from "../../utils/createProfile";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");



  const handleSignup = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // saves to user_metadata
        },
      });
      

      if (error) {
        console.error("Signup error:", error.message);
        setErrorMsg("Signup failed.", error.message);
         } 

      const user = data?.user;
      
     if(user){
        setSuccessMsg("Success! Check your email to confirm your account.");
        setEmail("");
        setPassword("");
        setName("");
        createProfile(user);
      }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-300 via-indigo-500 to-indigo-900 text-white px-4">

  <form
    onSubmit={handleSignup} // or handleSignup
    className="w-full max-w-sm bg-zinc-800 rounded-xl p-6 shadow-md flex flex-col gap-4"
  >
    {successMsg && (
    <p className="text-white text-lg text-center">{successMsg}</p>
        )}
    {errorMsg && (
    <p className="text-white text-lg text-center">{errorMsg}</p>
    )}
    <h2 className="text-2xl text-white font-bold text-center">Sign Up</h2>

    <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First Name"
        required
        className="p-2 rounded bg-zinc-700 text-white placeholder-zinc-400"
    />

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
    <p className="text-xs text-zinc-500 mt-1">
      Password must include lowercase, uppercase, number, and special character.
    </p>
    {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

    <button
      type="submit"
      disabled={loading}
      className="bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-2 rounded"
    >
      {loading ? "Signing up..." : "Sign Up"}
    </button>
    
  </form>
</div>
  );
}
