// import { createContext, useContext, useEffect, useState } from "react";
// import { getCurrentUser } from "../services/auth.service";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUser = async () => {
//     try {
//       const res = await getCurrentUser();
//       setUser({
//         ...res.data.data.user,
//         roleData: res.data.data.roleData
//       });
//     } catch (err) {
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUser()
//     const loadUser = async () => {
//       try {
//         const res = await API.get("/users/me");
//         setUser(res.data.data.user);
//       } catch (err) {
//         if (err.response?.status === 401) {
//           setUser(null); // normal
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, setUser, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "../services/auth.service";

const AuthContext = createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const fetchUser = async () => {
    try {
      const res =
        await getCurrentUser();

      setUser({
        ...res.data.data.user,
        roleData:
          res.data.data.roleData,
      });
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);