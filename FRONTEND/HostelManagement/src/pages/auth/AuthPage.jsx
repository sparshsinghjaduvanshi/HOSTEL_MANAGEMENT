import { useState } from "react";
import { loginUser, registerUser, sendOTP } from "../../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    enrollmentNo: "",
    gender: "male",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // SEND OTP
  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await sendOTP(formData.email);
      setOtpSent(true);
      alert("OTP sent to email");
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isLogin) {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        const user = res.data.data.user;

        // ✅ correct place
        setUser(user);

        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }

      } else {
        await registerUser(formData);
        alert("Registered successfully!");
        setIsLogin(true);
      }

    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <>
              <input name="fullName" placeholder="Full Name" onChange={handleChange} className="input" required />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="input" required />
              <input name="enrollmentNo" placeholder="Enrollment No" onChange={handleChange} className="input" required />

              <select name="gender" onChange={handleChange} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </>
          )}

          <input name="email" type="email" placeholder="Email" onChange={handleChange} className="input" required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} className="input" required />

          {!isLogin && (
            <div className="flex gap-2">
              <input name="otp" placeholder="Enter OTP" onChange={handleChange} className="input flex-1" required />
              <button type="button" onClick={handleSendOTP} className="bg-blue-500 text-white px-3 rounded">
                OTP
              </button>
            </div>
          )}

          <button className="w-full bg-blue-600 text-white py-2 rounded">
            {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="text-center mt-4">
          {isLogin ? "No account?" : "Already registered?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 ml-2"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthPage;