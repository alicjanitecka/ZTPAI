from django.contrib import admin
from django.urls import path, include
from api.controllers.petsitter_controller import PetsitterMeView
from api.controllers.pet_controller import PetListCreateView, PetUpdateDeleteView
from api.controllers.user_controller import CreateUserView, UserListView, UserDetailView, UserDeleteView, UserProfileView
from api.controllers.petsitter_controller import PetsitterSearchView, PetsitterCreateView, PetsitterMeView
from api.views import VisitCreateView, VisitListView, VisitUpdateView, PetsitterAvailabilityListCreateView, PetsitterAvailabilityUpdateDeleteView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.serializers import CustomTokenObtainPairSerializer
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

from django.conf import settings
from django.conf.urls.static import static

from django.conf.urls import handler400, handler403, handler404, handler500


schema_view = get_schema_view(
    openapi.Info(
        title="Petzone API",
        default_version='v1',
        description="Dokumentacja API dla Petzone",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/home/", UserListView.as_view(), name="home"),
    path("api/user/<int:pk>/delete/", UserDeleteView.as_view(), name="delete_user"),
    path("api/users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
    path("api/token/", TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/petsitters/search/", PetsitterSearchView.as_view(), name="petsitter_search"),
    path('api/visits/', VisitCreateView.as_view(), name='visit_create'),
    path('api/my-visits/', VisitListView.as_view(), name='my-visits'),
    path('api/visits/<int:pk>/', VisitUpdateView.as_view(), name='visit-update'),
    path('api/petsitters/', PetsitterCreateView.as_view(), name='petsitter-create'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/pets/', PetListCreateView.as_view(), name='pet-list-create'),
    path('api/pets/<int:pk>/', PetUpdateDeleteView.as_view(), name='pet-update-delete'),
    path('api/petsitters/me/', PetsitterMeView.as_view(), name='petsitter-me'),
    path('api/petsitter-availability/', PetsitterAvailabilityListCreateView.as_view(), name='petsitter-availability-list-create'),
    path('api/petsitter-availability/<int:pk>/', PetsitterAvailabilityUpdateDeleteView.as_view(), name='petsitter-availability-update-delete'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler400 = 'api.error_handlers.bad_request'
handler403 = 'api.error_handlers.permission_denied'
handler404 = 'api.error_handlers.page_not_found'
handler500 = 'api.error_handlers.server_error'
