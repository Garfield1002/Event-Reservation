import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import { Button, Form, Spinner, Container, Alert } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { AuthContext } from "../../core/AuthContext";

const VERIFY = gql`
  mutation verifyUser($token: String!) {
    verifyToken(token: $token) {
      payload
    }
  }
`;

interface VERIFY_TYPE {
  verifyToken: {
    payload: string;
  };
}

const SIGN_IN = gql`
  mutation signInUser($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }
`;

interface SIGN_IN_TYPE {
  tokenAuth: {
    token: string;
  };
}

const LoginF = ({
  setJwt,
  location,
}: {
  setJwt: (jwt: string | null) => void;
  location: { state: { from: { pathname: string } } } | undefined;
}) => {
  const [signIn, { loading, error, data }] = useMutation<SIGN_IN_TYPE>(SIGN_IN);
  const [
    verifyToken,
    { data: verificationData, loading: verificationLoading },
  ] = useMutation<VERIFY_TYPE>(VERIFY);

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
      verifyToken({ variables: { token } });
    }
  }, [verifyToken]);

  const from = location ? location.state.from : { pathname: "/" };

  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity()) {
      signIn({ variables: { ...formData, username: formData.email } });
      setFormData({ ...formData, password: "" });
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  if (data || verificationData) {
    const token = data
      ? data.tokenAuth.token
      : (sessionStorage.getItem("jwtToken") as string);
    sessionStorage.setItem("jwtToken", token);
    setJwt(token);
    return <Redirect to={from} />;
  }

  if (verificationLoading) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center h-100">
        <Spinner animation="grow" />
      </Container>
    );
  }

  return (
    <Container className="px-5 d-flex flex-column justify-content-center">
      <h1 className="my-5">Login</h1>

      <Form noValidate validated={false} onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            required
            size="lg"
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid email address.
          </Form.Control.Feedback>
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formName">
          <Form.Label>Password</Form.Label>
          <Form.Control
            required
            name="password"
            size="lg"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            Please enter your password.
          </Form.Control.Feedback>
        </Form.Group>

        <Button variant="primary" type="submit" block>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              Loading...
            </>
          ) : (
            <>Continue</>
          )}
        </Button>
      </Form>
      {error && (
        <Alert className="mt-5" variant="danger" dismissible>
          Incorrect username or password
        </Alert>
      )}
    </Container>
  );
};

const Login = ({
  location,
}: {
  location: { state: { from: { pathname: string } } };
}) => (
  <AuthContext.Consumer>
    {({ setJwt }) => <LoginF setJwt={setJwt} location={location} />}
  </AuthContext.Consumer>
);

export default Login;
