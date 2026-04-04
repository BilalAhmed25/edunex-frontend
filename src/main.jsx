import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/themes/light.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/assets/scss/app.scss";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
    <>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: false }}>
            <Provider store={store}>
                <App />
            </Provider>
        </BrowserRouter>
    </>
);
