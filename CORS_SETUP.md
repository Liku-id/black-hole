# CORS Setup for Backend API

## Problem

Your frontend (running on `http://localhost:3000`) is trying to access your backend API (running on `http://localhost:8080`), but the browser is blocking the request due to CORS policy.

## Solution 1: Backend CORS Configuration (Recommended)

Add CORS headers to your backend API. Here are examples for different frameworks:

### Express.js (Node.js)

```javascript
const cors = require('cors');

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  })
);
```

### Spring Boot (Java)

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/v1/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(false);
    }
}
```

### Django (Python)

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
]
```

### Go (Gin)

```go
import "github.com/gin-contrib/cors"

router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
    AllowCredentials: false,
}))
```

## Solution 2: Frontend Proxy (Already Implemented)

I've already configured a proxy in your Next.js app that will route requests from `/api/v1/*` to `http://localhost:8080/v1/*`. This should work automatically.

## Testing

1. Restart your Next.js development server
2. The API calls should now work through the proxy at `/api/v1/event-organizers`
3. Check the browser network tab to confirm requests are going through

## Production

For production, you should:

1. Configure proper CORS on your backend
2. Update the `API_BASE_URL` in `src/services/api.ts` to point to your production API
3. Remove the proxy configuration if not needed
