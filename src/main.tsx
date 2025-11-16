import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import {BrowserRouter} from "react-router-dom";

import { AuthProvider, AuthProviderProps } from "react-oidc-context";
//export const redirectUri = "https://d1i4ngjfyhcuut.cloudfront.net/auth/callback";
export const redirectUri = "https://localhost:44407/auth/callback";

//redirect_uri: "https://localhost:44407/auth/callback",
const cognitoAuthConfig: AuthProviderProps = {
  authority: "https://cognito-idp.sa-east-1.amazonaws.com/sa-east-1_abyVMc2Px",
  client_id: "1dthdfdnlojrvd2c56663dvo86",
   // redirect_uri: "https://localhost:44407/auth/callback",
   redirect_uri: redirectUri,
  response_type: "code", // именно code, не token
  scope: "email openid",
  // можно добавить опцию для отображения login-страницы вместо signup:
  //extraQueryParams: { screen_hint: "login" },

    onSigninCallback: () => { //  вот ЭТО удаляет /auth/callback?code=
        window.history.replaceState({}, document.title, "/");
    },
    // metadata: {
    //     end_session_endpoint: "https://sa-east-1abyvmc2px.auth.sa-east-1.amazoncognito.com/logout",
    // },
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Не найден элемент root в index.html");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
