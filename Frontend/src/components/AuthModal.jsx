import { useContext, useState } from "react";
import "./AuthModal.css";
import { MyContext } from "../MyContext";
import { login, signup } from "../services/authService";
import toast from "react-hot-toast";

export default function AuthModal() {

    const {
        showAuthModal,
        setShowAuthModal,
        authMode,
        setAuthMode,
        setUser,
        setToken
    } = useContext(MyContext);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    if (!showAuthModal) return null;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {

        try {

            setLoading(true);
            setError("");

            let res;

            if (authMode === "login") {
                res = await login({
                    email: form.email,
                    password: form.password
                });
            } else {

                res = await signup(form);

            }

            localStorage.setItem("token", res.data.token);

            setToken(res.data.token);

            setUser(res.data.user);

            setShowAuthModal(false);

            if (authMode === "login") {
    toast.success(`Welcome back, ${res.data.user.name}!`);
} else {
    toast.success("Welcome to NovaGPT! 🎉");
}

            setForm({
                name: "",
                email: "",
                password: ""
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Something went wrong."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="authOverlay">

            <div className="authModal">

                <button
                    className="closeBtn"
                    onClick={() => setShowAuthModal(false)}
                >
                    ×
                </button>

                <h2>
                    {authMode === "login"
                        ? "Welcome Back"
                        : "Create Account"}
                </h2>

                {authMode === "signup" && (

                    <input
                        placeholder="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                )}

                <input
                    placeholder="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                />

                {error && (
                    <p className="authError">
                        {error}
                    </p>
                )}

                <button
                    className="authBtn"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading
                        ? "Please wait..."
                        : authMode === "login"
                            ? "Log In"
                            : "Create Account"}
                </button>

                <p className="switchText">

                    {authMode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <span
                        onClick={() =>
                            setAuthMode(
                                authMode === "login"
                                    ? "signup"
                                    : "login"
                            )
                        }
                    >
                        {authMode === "login"
                            ? " Sign Up"
                            : " Log In"}
                    </span>

                </p>

            </div>

        </div>

    );

}