import React from "react";
import "./Loader.css"; // Your custom styles for the loader
import loaderGif from "./loader.gif"; // Path to your loader GIF image

const Loader = () => {
  return (
    <div className="loader">
      <img src={loaderGif} alt="Loading..." />
    </div>
  );
};

export default Loader;
