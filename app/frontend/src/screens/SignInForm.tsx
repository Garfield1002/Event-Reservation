import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { Button, Form, Spinner, Container } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import backgroundImage from "./background.jpg";

const GET_EVENTS = gql`
  query GetEvents {
    allEvents {
      edges {
        node {
          id
          name
          maxParticipants
          participantsCount
        }
      }
    }
  }
`;

interface GET_EVENTS_TYPE {
  allEvents: {
    edges: [
      {
        node: {
          id: string;
          name: string;
          maxParticipants: number;
          participantsCount: number;
        };
      }
    ];
  };
}

const CREATE_PARTICIPANT = gql`
  mutation CreateParticipant(
    $name: String!
    $email: String!
    $partySize: Int!
    $eventId: ID!
  ) {
    createParticipant(
      input: {
        name: $name
        email: $email
        partySize: $partySize
        event: { id: $eventId }
      }
    ) {
      ok
      participant {
        id
      }
    }
  }
`;

interface CREATE_USER_TYPE {
  createParticipant: {
    participant: {
      id: string;
    };
  };
}

function SignInForm() {
  const history = useHistory();
  const [validated, setValidated] = useState(false);
  const {
    loading: queryLoading,
    error: queryError,
    data: events,
  } = useQuery<GET_EVENTS_TYPE>(GET_EVENTS);
  const [
    createUser,
    { loading: mutationLoading, error: mutationError, data },
  ] = useMutation<CREATE_USER_TYPE>(CREATE_PARTICIPANT);

  const [formData, setFormData] = useState<{
    email: string;
    name: string;
    eventId: undefined | string;
    partySize: number;
  }>({
    email: "",
    name: "",
    eventId: undefined,
    partySize: 1,
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity()) {
      console.log(formData);
      createUser({ variables: formData });
    }
    setValidated(true);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  if (data) {
    console.log(data);
    history.push(`/verification?id=${data.createParticipant.participant.id}`);
  }

  if (queryLoading)
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
            minHeight: "100%",
          }}
        >
          <Spinner animation="grow" />
        </Container>
      </div>
    );

  if (queryError || mutationError)
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
            minHeight: "100%",
          }}
        >
          <h1>Error :(</h1>
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
        <h1 className="mb-2 ">Events</h1>

        <p className="mb-5 text-justify">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis sint in
          voluptatum laborum veritatis illum nam non molestias eos repudiandae
          quod cupiditate dicta neque ea quos, alias minima quidem placeat.
        </p>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              required
              size="lg"
              type="email"
              name="email"
              placeholder="Enter your email ..."
              value={formData.email}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid email address.
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              We won't share this information with anybody.
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              name="name"
              size="lg"
              type="text"
              placeholder="Enter your name ..."
              value={formData.name}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please enter your name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="formPartySize">
            <Form.Label>Party size: {formData.partySize}</Form.Label>
            <Form.Control
              required
              name="partySize"
              size="lg"
              type="range"
              min={1}
              max={10}
              value={formData.partySize}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Please choose a party size.
            </Form.Control.Feedback>
            <div className="d-flex flex-row">
              <Form.Text className="text-muted">1</Form.Text>
              <Form.Text className="text-muted ml-auto">10</Form.Text>
            </div>
          </Form.Group>

          <Form.Group controlId="formEvent">
            <Form.Label>Event</Form.Label>
            <Form.Control
              required
              size="lg"
              as="select"
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
            >
              <option disabled selected value={undefined}>
                Choose an event
              </option>
              {events?.allEvents.edges.map(({ node }) => (
                <option
                  disabled={
                    node.maxParticipants - node.participantsCount <
                    formData.partySize
                  }
                  value={node.id}
                  key={node.id}
                >
                  {node.name} ({node.maxParticipants - node.participantsCount}{" "}
                  place(s) restante(s))
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Please choose a valid event.
            </Form.Control.Feedback>
          </Form.Group>

          <Button variant="primary" type="submit" block>
            {mutationLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Loading...
              </>
            ) : (
              <>Continue</>
            )}
          </Button>
        </Form>
      </Container>
    </div>
  );
}

export default SignInForm;
