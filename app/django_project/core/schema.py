from django.db.models.aggregates import Sum
import graphene
import datetime
from django.utils import timezone
from django.utils import crypto
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql import GraphQLError
from django.template.loader import render_to_string
from graphql_jwt.decorators import login_required

from django_project.core.models import Participant, Event


class UserType(DjangoObjectType):
    class Meta:
        model = get_user_model()


class participantNode(DjangoObjectType):
    class Meta:
        model = Participant
        fields = (  # noqa: F811
            "name",
            "event",
            "queue",
            "expiration",
            "partySize")
        filter_fields = ['name', 'expiration']
        interfaces = (graphene.relay.Node, )


class eventNode(DjangoObjectType):
    class Meta:
        model = Event
        fields = (  # noqa: F811
            'name',
            'max_participants',
            'participants_count',
            'waiting_participants_count',
            'uid')
        filter_fields = ['name', 'max_participants']
        interfaces = (graphene.relay.Node, )

    uid = graphene.ID()
    participants_count = graphene.Int()
    waiting_participants_count = graphene.String()

    def resolve_uid(parent, info):
        return parent.id

    def resolve_participants_count(parent, info):
        if parent.participants.aggregate(Sum('partySize'))['partySize__sum']:
            partySize = int(parent.participants.aggregate(Sum('partySize'))['partySize__sum'])
        else:
            partySize = 0
        return partySize

    def resolve_waiting_participants_count(parent, info):
        if parent.waiting_participants.aggregate(Sum('partySize'))['partySize__sum']:
            partySize = int(parent.waiting_participants.aggregate(Sum('partySize'))['partySize__sum'])
        else:
            partySize = 0
        return partySize


class Query(graphene.ObjectType):
    event = graphene.relay.Node.Field(eventNode)
    all_events = DjangoFilterConnectionField(eventNode)
    users = graphene.List(UserType)
    me = graphene.Field(UserType)
    ...

    def resolve_users(self, info):
        return get_user_model().objects.all()

    def resolve_me(self, info):
        user = info.context.user
        if user.is_anonymous:
            raise Exception('Not logged in!')

        return user


class EventInput(graphene.InputObjectType):
    id = graphene.ID()
    name = graphene.String()
    max_participants = graphene.Int()


class ParticipantInput(graphene.InputObjectType):
    id = graphene.ID()
    event = EventInput()
    name = graphene.String()
    email = graphene.String()
    partySize = graphene.Int()


class VerificationInput(graphene.InputObjectType):
    id = graphene.ID()
    code = graphene.String()


class CreateEvent(graphene.Mutation):
    class Arguments:
        input = EventInput(required=True)

    ok = graphene.Boolean()
    event = graphene.Field(eventNode)

    @staticmethod
    @login_required
    def mutate(root, info, input=None):
        event_instance = Event(
            name=input.name,
            max_participants=input.max_participants
        )
        event_instance.save()
        return CreateEvent(ok=True, event=event_instance)


class CreateParticipant(graphene.Mutation):
    class Arguments:
        input = ParticipantInput(required=True)

    ok = graphene.Boolean()
    participant = graphene.Field(participantNode)

    @staticmethod
    def mutate(root, info, input=None):
        # check if the event exists
        my_event = graphene.Node.get_node_from_global_id(info, input.event.id)
        if my_event is None:
            return CreateParticipant(ok=False, participant=None)

        # the claim will expire in 5min
        in_5_min = datetime.datetime.now() + datetime.timedelta(minutes=5)

        # generates a 4 digit verification code
        # using the crypto library is important
        verification_code = crypto.get_random_string(length=4, allowed_chars='0123456789')

        # sends this verification code by email to the user
        send_mail(
            'Verification Code',             # subject
            '',                         # plain text content
            None,                       # from
            [input.email],              # to, TODO: verify valid email
            fail_silently=True,
            html_message=render_to_string(
                'email/verification.html',
                {
                    'code': verification_code,
                    'name': input.name,
                    'partySize': input.partySize,
                    'event': my_event.name}),
        )

        participant_instance = Participant(
            name=input.name,
            email=input.email,
            partySize=input.partySize,
            queue=my_event,
            expiration=in_5_min,
            code=verification_code,
        )

        participant_instance.save()
        return CreateParticipant(ok=True, participant=participant_instance)


class VerifyParticipant(graphene.Mutation):
    class Arguments:
        input = VerificationInput(required=True)

    ok = graphene.Boolean()
    participant = graphene.Field(participantNode)

    @staticmethod
    def mutate(root, info, input=None):

        # gets the participant from his ID
        me = graphene.Node.get_node_from_global_id(info, input.id)
        if me is None:
            return VerifyParticipant(ok=False, participant=None)

        # checks the code
        if input.code == me.code:
            # checks expiration can't compare offset-naive and offset-aware datetimes
            if me.expiration > timezone.now():

                if me.queue.participants.aggregate(Sum('partySize'))['partySize__sum']:
                    partySize = int(me.queue.participants.aggregate(Sum('partySize'))['partySize__sum'])
                else:
                    partySize = 0

                # checks availability
                if partySize + me.partySize <= me.queue.max_participants:
                    # adds the user to the event
                    me.event = me.queue
                    me.queue = None
                    me.save()
                else:
                    raise GraphQLError('This event is complete.')
            else:
                raise GraphQLError('Your request has expired please try again.')
        else:
            raise GraphQLError('Incorrect code.')

        return VerifyParticipant(ok=True, participant=me)


class CreateUser(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        username = graphene.String(required=True)
        password = graphene.String(required=True)
        email = graphene.String(required=True)

    def mutate(self, info, username, password, email):
        user = get_user_model()(
            username=username,
            email=email,
        )
        user.set_password(password)
        user.save()

        return CreateUser(user=user)


class Mutation(graphene.ObjectType):
    create_event = CreateEvent.Field()
    create_participant = CreateParticipant.Field()
    verify_participant = VerifyParticipant.Field()
    create_user = CreateUser.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
