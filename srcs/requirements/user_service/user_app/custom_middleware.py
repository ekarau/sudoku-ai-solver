"""Custom middleware to handle internal service requests"""

class SkipHostValidationMiddleware:
    """Placeholder middleware for internal service API calls."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
