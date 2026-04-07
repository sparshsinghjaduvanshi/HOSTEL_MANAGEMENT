import { useState } from "react";
import { loginUser, registerUser } from "../services/authServices.js";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    enrollmentNo: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        console.log("Login Success:", res.data);

        // 👉 next step (we'll add later)
        // redirect based on role
      } else {
        const res = await registerUser(formData);

        console.log("Register Success:", res.data);

        // 👉 optional: auto switch to login
        setIsLogin(true);
      }
    } catch (error) {
      console.error(
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Login" : "Register"}
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Register Only Fields */}
          {!isLogin && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="w-full p-2 border rounded"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                className="w-full p-2 border rounded"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="enrollmentNo"
                placeholder="Enrollment Number"
                className="w-full p-2 border rounded"
                value={formData.enrollmentNo}
                onChange={handleChange}
                required
              />
            </>
          )}

          {/* Common Fields */}
          <input
            type="email"
            name="email"
            placeholder="College Email (@curaj.ac.in)"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-4">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 ml-2 font-medium"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;