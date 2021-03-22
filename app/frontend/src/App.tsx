import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import Login from "./screens/auth/Login";
import Protected from "./screens/protected/Protected";
import SignInForm from "./screens/SignInForm";
import VerificationForm from "./screens/VerificationForm";
import { AuthContext } from "./core/AuthContext";
import { useState } from "react";
import getCookie from "./core/getCookie";
import PrivateRoute from "./screens/auth/PrivateRoute";

function App() {
  const [jwt, setJwt] = useState<string | null>(null);

  const httpLink = createHttpLink({
    uri: "/graphql/",
    credentials: "same-origin",
  });

  const csrfLink = setContext((_, { headers }) => {
    const csrfToken = getCookie("csrftoken");
    return {
      headers: {
        ...headers,
        authorization: jwt ? `JWT ${jwt}` : "",
        "X-CSRFToken": csrfToken ? csrfToken : "",
      },
    };
  });

  const client = new ApolloClient({
    link: csrfLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return (
    <AuthContext.Provider value={{ jwt, setJwt }}>
      <ApolloProvider client={client}>
        <Router>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/protected" component={Protected} />
            <Route path="/verification" component={VerificationForm} />
            <Route path="/" component={SignInForm} />
          </Switch>
        </Router>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

export default App;
