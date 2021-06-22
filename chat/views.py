from django.shortcuts import render


def index(request):
    return render(request, 'index.html', {})


def room(request, room_name):
    return render(request, 'chatroom.html', {
        'room_name': room_name
    })

def register(request):
    return render(request, 'register.html', {})

def login(request):
    return render(request, 'login.html', {})
