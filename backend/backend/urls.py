from django.contrib import admin
from django.urls import path, include
from api.controllers.petsitter_controller import PetsitterMeView
from api.controllers.petsitter_availability_controller import PetsitterAvailabilityListCreateView, PetsitterAvailabilityUpdateDeleteView
from api.controllers.pet_controller import PetListCreateView, PetUpdateDeleteView
from api.controllers.user_controller import CreateUserView, UserListView, UserDetailView, UserDeleteView, UserProfileView
from api.controllers.petsitter_controller import PetsitterSearchView, PetsitterCreateView, PetsitterMeView, PetsitterDetailView
from api.controllers.visit_controller import VisitCreateView, VisitListView, VisitUpdateView, VisitAsOwnerView, VisitAsPetsitterView
from api.controllers.review_controller import ReviewCreateView, ReviewListForPetsitterView, ReviewDetailView
from api.controllers.chat_controller import ChatListView, ChatDetailView, ChatCreateView, ChatMessagesView, UnreadCountView
from api.controllers.notification_controller import NotificationListView, NotificationUnreadCountView, NotificationMarkAsReadView, NotificationMarkAllAsReadView
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
path('admin/v1/', admin.site.urls),
path('api/v1/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
path('api/v1/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
path("api/v1/user/register/", CreateUserView.as_view(), name="register"),
path("api/v1/admin-panel/", UserListView.as_view(), name="admin-panel"),
path("api/v1/user/<int:pk>/delete/", UserDeleteView.as_view(), name="delete_user"),
path("api/v1/users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
path("api/v1/token/", TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name="get_token"),
path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
path("api-auth/v1/", include("rest_framework.urls")),
path("api/v1/petsitters/search/", PetsitterSearchView.as_view(), name="petsitter_search"),
path('api/v1/petsitters/<int:pk>/', PetsitterDetailView.as_view(), name='petsitter-detail'),
path('api/v1/visits/', VisitCreateView.as_view(), name='visit_create'),
path('api/v1/my-visits/', VisitListView.as_view(), name='my-visits'),
path('api/v1/my-visits/as-owner/', VisitAsOwnerView.as_view(), name='visits-as-owner'),
path('api/v1/my-visits/as-petsitter/', VisitAsPetsitterView.as_view(), name='visits-as-petsitter'),
path('api/v1/visits/<int:pk>/', VisitUpdateView.as_view(), name='visit-update'),
path('api/v1/petsitters/', PetsitterCreateView.as_view(), name='petsitter-create'),
path('api/v1/profile/', UserProfileView.as_view(), name='user-profile'),
path('api/v1/pets/', PetListCreateView.as_view(), name='pet-list-create'),
path('api/v1/pets/<int:pk>/', PetUpdateDeleteView.as_view(), name='pet-update-delete'),
path('api/v1/petsitters/me/', PetsitterMeView.as_view(), name='petsitter-me'),
path('api/v1/petsitter-availability/', PetsitterAvailabilityListCreateView.as_view(), name='petsitter-availability-list-create'),
path('api/v1/petsitter-availability/<int:pk>/', PetsitterAvailabilityUpdateDeleteView.as_view(), name='petsitter-availability-update-delete'),
path('api/v1/reviews/', ReviewCreateView.as_view(), name='review-create'),
path('api/v1/reviews/petsitter/', ReviewListForPetsitterView.as_view(), name='reviews-for-petsitter'),
path('api/v1/reviews/<int:pk>/', ReviewDetailView.as_view(), name='review-detail'),
path('api/v1/chats/', ChatListView.as_view(), name='chat-list'),
path('api/v1/chats/create/', ChatCreateView.as_view(), name='chat-create'),
path('api/v1/chats/<int:pk>/', ChatDetailView.as_view(), name='chat-detail'),
path('api/v1/chats/<int:pk>/messages/', ChatMessagesView.as_view(), name='chat-messages'),
path('api/v1/chats/unread-count/', UnreadCountView.as_view(), name='unread-count'),
path('api/v1/notifications/', NotificationListView.as_view(), name='notification-list'),
path('api/v1/notifications/unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
path('api/v1/notifications/<int:pk>/read/', NotificationMarkAsReadView.as_view(), name='notification-mark-read'),
path('api/v1/notifications/read-all/', NotificationMarkAllAsReadView.as_view(), name='notification-mark-all-read'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


