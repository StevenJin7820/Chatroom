from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name ='index'),
    path('register/', views.register, name = 'register'),
    path('logout/', views.logoutUser, name = 'logout'),
    path('home/create_room', views.create_room, name = 'create_room'),
    path('home/join_room', views.join_room, name = 'join_room'),
    path('home/chatrooms/<str:room_name>/', views.room, name='room'),
    path('home/', views.home, name='home')

]