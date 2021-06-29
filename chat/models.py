from django.db import models

# Create your models here.

class Room(models.Model):
    room_name = models.CharField(max_length = 200)
    def __str__(self):
        return self.room_name

class User(models.Model):
    name = models.CharField(max_length=200, null = True)
    username = models.CharField(max_length=200)
    password = models.CharField(max_length=200)
    email = models.CharField(max_length=200, null = True)
    date_created = models.DateTimeField(auto_now_add=True)
    room = models.ForeignKey(Room, null = True, on_delete= models.SET_NULL )

    def __str__(self):
        return self.name

