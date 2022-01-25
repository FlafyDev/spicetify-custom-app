import ReactType from "react";
import ReactDomType from "react";
import App from "./src/app";
const React: typeof ReactType = Spicetify.React;
const ReactDOM: typeof ReactDomType = Spicetify.ReactDOM;

export default function render() {
  return <App />
}

export { React, ReactDOM }