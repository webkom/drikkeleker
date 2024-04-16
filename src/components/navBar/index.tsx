import React from "react";

import { Link } from "react-router-dom";
import "./navBar.css";
import { Box, Toolbar } from "@mui/material";

export const NavBar: React.FC = () => {
  return (
    <>
      <Box
        className="navBarBox"
        sx={{
          color: "black",
        }}
      >
        <Toolbar
          className="toolBar"
          sx={{
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        >
          {/* The website logo on the far left */}

          <Box className="box">
            <Link className="navLink" to="/">
              Home
            </Link>
          </Box>
        </Toolbar>
      </Box>
    </>
  );
};
