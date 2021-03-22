import { gql, useMutation, useQuery } from "@apollo/client";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { Button, Container, Form, Spinner, Table } from "react-bootstrap";
import { AuthContext } from "../../core/AuthContext";

const EVENTS = gql`
  query AllEvents {
    allEvents {
      edges {
        node {
          name
          uid
          maxParticipants
          participantsCount
        }
      }
    }
  }
`;

interface EVENTS_TYPE {
  allEvents: {
    edges: {
      node: {
        uid: number;
        name: string;
        maxParticipants: number;
        participantsCount: number;
      };
    }[];
  };
}

const CREATE_EVENT = gql`
  mutation CreateEvent($name: String!, $maxParticipants: Int!) {
    createEvent(input: { name: $name, maxParticipants: $maxParticipants }) {
      ok
    }
  }
`;

interface CREATE_EVENT_TYPE {
  createEvent: { ok: boolean };
}

const ProtectedF = ({
  setJwt,
  jwt,
}: {
  jwt: string | null;
  setJwt: (jwt: string | null) => void;
}) => {
  const { data } = useQuery<EVENTS_TYPE>(EVENTS, {
    pollInterval: 500,
  });

  const [createEvent, { loading }] = useMutation<CREATE_EVENT_TYPE>(
    CREATE_EVENT
  );

  const [formData, setFormData] = useState<{
    name: string;
    maxParticipants: number;
  }>({
    name: "",
    maxParticipants: 0,
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity()) {
      createEvent({ variables: formData });
      setFormData({
        name: "",
        maxParticipants: 0,
      });
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  return (
    <Container className="my-5 px-5 d-flex flex-column justify-content-center">
      <Form noValidate validated={false} onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail">
          <Form.Label>Event Name</Form.Label>
          <Form.Control
            required
            size="lg"
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid name.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="formName">
          <Form.Label>Max Participants</Form.Label>
          <Form.Control
            required
            size="lg"
            type="number"
            name="maxParticipants"
            placeholder="Enter max participants"
            value={formData.maxParticipants}
            onChange={handleChange}
          />
          <Form.Control.Feedback type="invalid">
            Please enter a valid number.
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
            <>Create Event</>
          )}
        </Button>
      </Form>
      {data && (
        <Table striped bordered hover size="sm" className="my-5">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Max Participants</th>
              <th>Participants</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {data.allEvents.edges.map(({ node }) => (
              <tr>
                <td>{node.name}</td>
                <td>{node.maxParticipants}</td>
                <td>{node.participantsCount}</td>
                <td>
                  <a href={`/download/?token=${jwt}&pk=${node.uid}`}>
                    Download CSV
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Button
        className="mt-5"
        onClick={() => {
          sessionStorage.removeItem("jwtToken");
          setJwt(null);
        }}
      >
        Log Out
      </Button>
    </Container>
  );
};

const Protected = () => (
  <AuthContext.Consumer>
    {({ setJwt, jwt }) => <ProtectedF setJwt={setJwt} jwt={jwt} />}
  </AuthContext.Consumer>
);

export default Protected;
