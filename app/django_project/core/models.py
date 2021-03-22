from django.db import models


class Event(models.Model):
    name = models.CharField(max_length=64)
    max_participants = models.IntegerField()

    def __str__(self):
        return self.name


# null  -> if empty will be stored as NULL
# blank -> not required
class Participant(models.Model):
    name = models.CharField(max_length=64)
    email = models.EmailField()
    event = models.ForeignKey(Event, related_name="participants", on_delete=models.CASCADE, blank=True, null=True)
    queue = models.ForeignKey(Event, related_name="waiting_participants", on_delete=models.CASCADE, blank=True, null=True)
    code = models.CharField(max_length=4)
    expiration = models.DateTimeField()
    partySize = models.IntegerField()

    def __str__(self):
        return self.name
