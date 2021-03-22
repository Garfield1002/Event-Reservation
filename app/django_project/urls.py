from django.contrib import admin
from django.urls import path, re_path
from django.urls.conf import include
from graphene_django.views import GraphQLView
from graphql_jwt.decorators import jwt_cookie
from django_project.core.views import some_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('download/', some_view),
    path('graphql/', GraphQLView.as_view(graphiql=True)),
    re_path(r'', include('django_project.frontend.urls')),
]
