from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if not response:
        return Response(
            {"error": "Internal Server Error", "detail": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    custom_response = {
        "error": response.status_code,
        "message": response.data.get("detail", "Unknown error"),
        "details": response.data
    }
    response.data = custom_response
    return response
