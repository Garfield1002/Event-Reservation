import { createContext } from "react";

export interface AUTH_CONTEXT_TYPE {
  jwt: string | null;
  setJwt: (jwt: string | null) => void;
}

export const AuthContext = createContext<AUTH_CONTEXT_TYPE>({
  jwt: null,
  setJwt: () => {},
});
