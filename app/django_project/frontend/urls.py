from django.urls import re_path
from . import views
from graphql_jwt.decorators import jwt_cookie


urlpatterns = [
    re_path(r'', views.index),
]
