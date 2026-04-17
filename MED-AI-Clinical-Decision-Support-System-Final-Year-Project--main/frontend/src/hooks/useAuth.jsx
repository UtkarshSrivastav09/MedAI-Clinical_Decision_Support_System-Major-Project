import { useState } from "react";

const useAuth = () => {
  const [error, setError] = useState("");

  const register = async (username, email, password, organization) => {
    try {
      setError("");
      
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, organization }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Registration failed");
        return false;
      }
      
      const data = await res.json();
      sessionStorage.setItem("organization", data.organization);
      
      return true;
    } catch (err) {
      setError("Unable to connect to Server API.");
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      setError("");
      
      const res = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Invalid username or password");
        return false;
      }
      
      const data = await res.json();
      sessionStorage.setItem("organization", data.organization);
      
      return true;
    } catch (err) {
      setError("Unable to connect to Server API.");
      return false;
    }
  };

  return { register, login, error };
};

export default useAuth;