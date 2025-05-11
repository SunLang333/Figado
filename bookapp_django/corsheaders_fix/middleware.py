import logging

class CorsDebugMiddleware:
    """
    Middleware to help debug CORS issues by printing request/response details.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('django.request')

    def __call__(self, request):
        # Print incoming request details
        self.logger.info(f"CORS DEBUG - Incoming request: {request.method} {request.path}")
        self.logger.info(f"CORS DEBUG - Headers: {request.headers}")

        # Process the request
        response = self.get_response(request)

        # Print response details
        self.logger.info(f"CORS DEBUG - Response status: {response.status_code}")
        self.logger.info(f"CORS DEBUG - Response headers: {response.headers}")

        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.method == 'OPTIONS':
            self.logger.info(f"CORS DEBUG - OPTIONS request detected for path: {request.path}")
        return None
