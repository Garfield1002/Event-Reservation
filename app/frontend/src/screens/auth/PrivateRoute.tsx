import { Redirect, Route } from "react-router";
import { AuthContext } from "../../core/AuthContext";

const PrivateRoute = ({
  component: Child,
  ...rest
}: {
  component: any;
  [key: string]: any;
}) => (
  <AuthContext.Consumer>
    {({ jwt }) => (
      <Route
        {...rest}
        render={(props) =>
          jwt ? (
            <Child {...props} />
          ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location },
              }}
            />
          )
        }
      />
    )}
  </AuthContext.Consumer>
);

export default PrivateRoute;
