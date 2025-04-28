from django.http import JsonResponse

def bad_request(request, exception=None):
    return JsonResponse({"error": 400, "message": "Bad Request"}, status=400)

def permission_denied(request, exception=None):
    return JsonResponse({"error": 403, "message": "Permission Denied"}, status=403)

def page_not_found(request, exception=None):
    return JsonResponse({"error": 404, "message": "Not Found"}, status=404)

def server_error(request):
    return JsonResponse({"error": 500, "message": "Internal Server Error"}, status=500)
