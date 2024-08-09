import React from 'react';
import { Route,Routes } from "react-router-dom";
import Login from "./components/auth/login";
import { AuthProvider } from "./contexts/authContext";
import Home from "./components/Home/Home";


const Routs = () => {
  return (
    <div>
        <AuthProvider>
            <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            </Routes>
        </AuthProvider>
    </div>
  )
}

export default Routs