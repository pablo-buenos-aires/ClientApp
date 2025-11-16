/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GITHUB_ACTIONS?: string;
    readonly VITE_REDIRECT_URI?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
