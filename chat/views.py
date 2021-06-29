from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from .models import *
from .forms import CreateUserForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import CreateRoomForm

def register(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        form = CreateUserForm()
        if request.method == 'POST':
            form = CreateUserForm(request.POST)
            if form.is_valid():
                form.save()
                user = form.cleaned_data.get('username')
                messages.success(request, 'Account was created for '+ user)
                return redirect('index')
                
    context = {'form' :form}
    return render(request, 'register.html', context)

def index(request):
	if request.user.is_authenticated:
		return redirect('home')
	else:
		if request.method == 'POST':
			username = request.POST.get('username')
			password =request.POST.get('password')

			user = authenticate(request, username=username, password=password)

			if user is not None:
				login(request, user)
				return redirect('home')
			else:
				messages.info(request, 'Username OR password is incorrect')

		context = {}
		return render(request, 'index.html', context)

def logoutUser(request):
	logout(request)
	return redirect('index')

@login_required(login_url='index')
def home(request):
    rooms = Room.objects.all()
    return render(request, 'home.html', {'rooms': rooms})

@login_required(login_url='index')
def room(request, room_name):
    return render(request, 'chatroom.html', {
        'room_name': room_name
    })

@login_required(login_url='index')
def create_room(request):
    form = CreateRoomForm()
    if request.method == 'POST':
        form = CreateRoomForm(request.POST)
        if form.is_valid():
            form.save()
            room_name = form.cleaned_data.get('room_name')
            return redirect('chatrooms/'+room_name)

    context = {'form':form}
    return render(request, 'room_form.html', context)

@login_required(login_url='index')
def join_room(request):
    if request.method == 'POST':
        room_name = request.POST.get('Room')
        return redirect('chatrooms/'+room_name)

    return render(request, 'room_join.html')