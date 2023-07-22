import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

const Header = () => {
  const { setUserinfo, userInfo } = useContext(UserContext);
  useEffect(() => {
    async function profile() {
      const response = await fetch("http://localhost:4000/profile", {
        credentials: "include",
      });
      const userInfo = await response.json();
      setUserinfo(userInfo);
    }
    profile();
  }, []);
  // useEffect(() => {
  //   fetch('http://localhost:4000/profile', {
  //     credentials: 'include',
  //   }).then(response => {
  //     response.json().then(userInfo => {
  //       setUserinfo(userInfo);
  //     });
  //   });
  // }, []);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserinfo(null);
  }
  const username = userInfo?.username;
  return (
    <header>
      <Link  to="/" className="logo">
        TECHNO-BLOG
      </Link>
      <nav>
        {username && (
          <>
            <Link className="css-button" to="/createpost">Create New Post</Link>
            <a className="css-button" onClick={logout}>Logout</a>
          </>
        )}
        {!username && (
          <>
            <Link className="css-button" to="/login">Login</Link>
            <Link className="css-button" to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};
export default Header;
