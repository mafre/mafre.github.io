import './style.css'
import * as React from 'react';
import * as ReactDOM from "react-dom/client";
import {  Routes, Route, BrowserRouter, Link, Outlet } from "react-router-dom";
import Load from './load'

const Game = () => {
  React.useEffect(() => {

      const load = new Load();
      load.init(document.getElementById("game"));

    }, []);

  return <></>
}

const Layout = () => {

  return <div>
    <Outlet />
  </div>
}

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Game />} />
          <Route path="*" element={<div />} />
        </Route>
      </Routes>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("app")).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
);