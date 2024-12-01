import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ChatUI } from './components/ChatUI';
import {LoginUI} from './components/LoginUI';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const isAuthenticated = ()=>{
  return localStorage.getItem("token") !== null;
};

const App = () =>{
  return(
    <Router>
      <Routes>
        <Route path="/login" element={<LoginUI/>} />
        <Route path="/chat" element={isAuthenticated() ? <ChatUI /> : <Navigate to="/login"/>} />
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/chat" : "/login"} />} />
      </Routes>
    </Router>
  )
}

root.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
