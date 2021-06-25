from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name ='index'),
    path('register/', views.register, name = 'register'),
    path('logout/', views.logoutUser, name = 'logout'),
    path('<str:room_name>/', views.room, name='room'),
    path('home/', views.home, name='home')
]