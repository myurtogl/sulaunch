import "./general.css";
import React, { useState } from "react";
// Routing
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
// Components
import HomeNew from "./components/HomeNew";
import Project from "./components/Project";
import NotFound from "./components/NotFound";
import ProjectList from "./components/ProjectList";
import Apply from "./components/Apply";
import Auctions from "./components/Auctions";
import Auction from "./components/Auction";
import CreateTokens from "./components/CreateTokens";
import CreateAuction from "./components/CreateAuction";
import ProfilePage from "./components/ProfilePage";
import HowToUse from "./components/HowToUse";
import Admin from "./components/Admin";
import About from "./components/About/About";

import Templates from "./templates"; // CAN BE DELETED

// Context
import { UserContext } from "./User";
// Styles
import { GlobalStyle } from "./GlobalStyle";
import "bootstrap/dist/css/bootstrap.min.css";
import NotAuthorized from "./components/NotAuthorized";
import WithNav from "./WithNav";

import Viewer from "./Viewer";
import InstallMetamask from "./components/InstallMetamask";
import UserNotVerified from "./components/UserNotVerified";
import UserVerified from "./components/UserVerified";
const App = () => {
  const Router =
    process.env.REACT_APP_IFS === "True" ? HashRouter : BrowserRouter;
  const [address, setAddress] = useState("");
  const value = { address, setAddress };

  return (
    <Router>
      <div className="app">
        <UserContext.Provider value={value}>
          {/* TODO: HIGHLIGH SELECTED NAVBAR BUTTON */}
          <Routes>
            <Route path="/" element={<WithNav />}>
              <Route index element={<HomeNew />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/createTokens" element={<CreateTokens />} />
              <Route path="/createAuction" element={<CreateAuction />} />
              <Route path="/auctions" element={<Auctions />} />
              {/*<Route path='/tokenSwap' element={<TokenSwap />} />*/}
              <Route path="/projects/:projectId" element={<Project />} />
              <Route path="/auction/:projectId" element={<Auction />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/tt" element={<Templates />} />
              <Route path="/notAuthorized" element={<NotAuthorized />} />
              <Route path="/Viewer" element={<Viewer />} />
              <Route path="/*" element={<NotFound />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/install-metamask" element={<InstallMetamask />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/user-not-verified" element={<UserNotVerified />} />
              <Route path="/user-verified" element={<UserVerified />} />
            </Route>
          </Routes>
          <GlobalStyle />
        </UserContext.Provider>
      </div>
    </Router>
  );
};

export default App;
