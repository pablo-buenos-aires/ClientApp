import React, { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import IndexPage from "./pages/IndexPage";

const App: React.FC = () => {
    const auth = useAuth();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated && !auth.error) {
            console.log("Not authenticated, redirecting to Cognito login...");
          // Небольшая задержка, чтобы избежать race condition
            setTimeout(() => {
                auth.signinRedirect({
                    extraQueryParams: { screen_hint: "login" },
                });
            }, 100);
        }
    }, [auth]);

    if (auth.isLoading) {
        return <div>Loading…</div>;
    }

    if (auth.error) {
        return <div>Encountered error: {auth.error?.message}</div>;
    }

    if (auth.isAuthenticated) {
        return <IndexPage />;
    }

    // Показываем loading пока редирект не произошел
    return <div>Redirecting to login...</div>;
};

export default App;