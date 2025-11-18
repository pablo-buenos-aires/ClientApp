import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import {BrowserRouter} from "react-router-dom";
import { AuthProvider, AuthProviderProps } from "react-oidc-context";

const getRedirectUri = () => {
    if (typeof window !== "undefined" && window.location) {
        return `${window.location.origin}/auth/callback`;
    }
    return "https://localhost:44407/auth/callback";
}
export const redirectUri =  getRedirectUri();
//    import.meta.env.VITE_GITHUB_ACTIONS === "true"
//        ? "https://d1i4ngjfyhcuut.cloudfront.net/auth/callback" : "https://localhost:44407/auth/callback";

//redirect_uri: "https://localhost:44407/auth/callback",
const cognitoAuthConfig: AuthProviderProps = {
  authority: "https://cognito-idp.sa-east-1.amazonaws.com/sa-east-1_abyVMc2Px",
  client_id: "1dthdfdnlojrvd2c56663dvo86",
  redirect_uri: redirectUri,
  response_type: "code", // именно code, не token
  scope: "email openid",
  onSigninCallback: () => { //  вот ЭТО удаляет /auth/callback?code=
        window.history.replaceState({}, document.title, "/");
    },
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
