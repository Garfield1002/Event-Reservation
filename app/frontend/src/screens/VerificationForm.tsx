import {
  useState,
  FormEventHandler,
  ChangeEventHandler,
  FocusEventHandler,
} from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import "./Verification.css";
import { Container } from "react-bootstrap";
import { useLocation } from "react-router";
import { gql, useMutation } from "@apollo/client";
import backgroundImage from "./background.jpg";

const VERIFY_USER = gql`
  mutation verify($id: ID!, $code: String!) {
    verifyParticipant(input: { id: $id, code: $code }) {
      ok
      participant {
        event {
          name
        }
      }
    }
  }
`;

interface VERIFY_USER_TYPE {
  verifyParticipant: {
    ok: boolean;
    participant: {
      event: { name: string };
    };
  };
}

function VerificationForm() {
  const URLData = new URLSearchParams(useLocation().search);
  const [verify, { data, loading, error }] = useMutation<VERIFY_USER_TYPE>(
    VERIFY_USER
  );
  const [verificationCode, setVerificationCode] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    verify({
      variables: { id: URLData.get("id"), code: verificationCode.join("") },
    });
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const form = event.target.form;
    const index = Array.prototype.indexOf.call(form, event.target);

    setVerificationCode(
      verificationCode.map((e, i) => (i === index ? event.target.value : e))
    );

    event.target.value === ""
      ? (form?.elements[index - 1] as HTMLElement)?.focus()
      : (form?.elements[index + 1] as HTMLElement)?.focus();
  };

  const handleFocus: FocusEventHandler = (e) => {
    (e.target as HTMLInputElement).select();
  };

  if (data?.verifyParticipant.ok)
    return (
      <div
        className="w-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
        }}
      >
        <Container
          className="d-flex flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            minHeight: "calc(100vh - 1px)",
          }}
        >
          <h1>Success</h1>
          <h3>
            You are signed up for{" "}
            {data.verifyParticipant.participant.event.name}.
          </h3>
        </Container>
      </div>
    );

  if (loading)
    return (
      <div
        className="w-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
        }}
      >
        <Container
          className="p-5 d-flex flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            minHeight: "calc(100vh - 1px)",
          }}
        >
          <Spinner animation="grow" />
        </Container>
      </div>
    );

  if (error)
    return (
      <div
        className="w-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
        }}
      >
        <Container
          className="p-5 d-flex flex-column justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            minHeight: "calc(100vh - 1px)",
          }}
        >
          <h1>Error :(</h1>
          <h3>{error.message}</h3>
        </Container>
      </div>
    );

  return (
    <div
      className="w-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
      }}
    >
      <Container
        className="p-5 d-flex flex-column justify-content-center"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          minHeight: "calc(100vh - 1px)",
        }}
      >
        <h1 className="my-5"> Email verification</h1>

        <Form
          onSubmit={handleSubmit}
          className="mt-5 d-flex flex-column justify-content-center"
        >
          <Form.Label>
            Please enter the verification code that you received by mail.
          </Form.Label>

          <Form.Group
            controlId="formVerification"
            className="my-5 d-flex justify-content-center"
          >
            {[0, 1, 2, 3].map((i) => (
              <input
                className="verificationDigit"
                type="text"
                maxLength={1}
                size={1}
                min={0}
                max={9}
                pattern="[0-9]{1}"
                key={i}
                value={verificationCode[i]}
                autoFocus={i === 0}
                onChange={handleChange}
                onFocus={handleFocus}
                required
              />
            ))}
          </Form.Group>

          <Button variant="primary" type="submit" className="mx-5">
            Submit
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default VerificationForm;
