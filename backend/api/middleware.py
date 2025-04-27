from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

class JsonErrorMiddleware(MiddlewareMixin):
    def process_exception(self, request, exc):
        return JsonResponse(
            {"error": "Internal Server Error", "detail": str(exc)},
            status=500
        )
