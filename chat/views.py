from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from .models import *
from .forms import CreateUserForm


def index(request):
    return render(request, 'index.html', {})


def room(request, room_name):
    return render(request, 'chatroom.html', {
        'room_name': room_name
    })

def register(request):
    form = CreateUserForm()
    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            form.save()
    context = {'form' :form}
    return render(request, 'register.html', context)

def login(request):
    form = UserCreationForm
    context = {"form": form}
    return render(request, 'login.html', context)
