import React from "react";
import ReactDOM from "react-dom";
import WebFont from "webfontloader";
import App from "./components/app";

WebFont.load({
  classes: false,
  google: {
    families: ["Roboto"]
  }
});

ReactDOM.render(<App />, document.querySelector("#root"));
