import csv
from django.http import HttpResponse
from django_project.core.models import Event
from django.contrib.auth.decorators import login_required
# from graphql_jwt.decorators import login_required
from django.http import HttpResponseForbidden


def some_view(request):

    # check auth
    if len(request.GET.get('token', '')) == 0:
        return HttpResponseForbidden()

    response = HttpResponse(content_type="text/csv")
    response['Content-Disposition'] = f'attachment; filename="{Event.objects.get(pk=int(request.GET.get("pk", 1))).name}.csv"'

    writer = csv.writer(response)

    header = [
        "Participant's Name",
        "Party Size",
    ]
    content = []

    event = Event.objects.get(pk=int(request.GET.get('pk', 1)))

    for participant in event.participants.all():
        content.append(
            [
                str(participant.name),
                str(participant.partySize),
            ]
        )

    writer.writerow(header)
    writer.writerows(content)
    return response
