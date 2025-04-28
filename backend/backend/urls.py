from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, UserListView, UserDetailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
    path("api/users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

handler400 = 'api.error_handlers.bad_request'
handler403 = 'api.error_handlers.permission_denied'
handler404 = 'api.error_handlers.page_not_found'
handler500 = 'api.error_handlers.server_error'
