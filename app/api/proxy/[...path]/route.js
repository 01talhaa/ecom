import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  return proxyRequest(request, params, 'GET');
}

export async function POST(request, { params }) {
  return proxyRequest(request, params, 'POST');
}

export async function PUT(request, { params }) {
  return proxyRequest(request, params, 'PUT');
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, params, 'DELETE');
}

async function proxyRequest(request, params, method) {
  try {
    // Access params directly
    const path = params.path;
    
    // Create API path from path segments
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    
    // Get base URL from environment variables
    const baseUrl = process.env.BASE_URL || 'https://api.tratechbd.com';
    
    // Get authorization header from the original request
    const authHeader = request.headers.get('Authorization');
    
    // Extract URL search params
    const url = new URL(request.url);
    const queryString = url.search;
    
    // Create the URL for the API request
    const apiUrl = `${baseUrl}/${apiPath}${queryString}`;
    
    console.log(`Proxying ${method} request to: ${apiUrl}`);
    
    // Set up headers for the API request
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log("Using auth header from request");
    } else {
      console.log("No auth header found in request - authentication may fail");
    }
    
    // For DELETE requests, we don't need to add a body
    // For PUT/POST, process the body as usual
    let body = null;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
      const contentType = request.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const requestBody = await request.json();
          body = JSON.stringify(requestBody);
          console.log(`Request body: ${body}`);
        } catch (e) {
          console.error("Error parsing request body:", e);
          return NextResponse.json(
            { success: false, message: "Invalid request body" },
            { status: 400 }
          );
        }
      } else {
        try {
          body = await request.text();
        } catch (e) {
          console.error("Error reading request body:", e);
        }
      }
    }
    
    // Configure the fetch request
    const fetchOptions = {
      method,
      headers,
    };
    
    // Only add the body for non-GET/HEAD/DELETE requests
    if (body && method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
      fetchOptions.body = body;
    }
    
    // Make the API request
    const response = await fetch(apiUrl, fetchOptions);
    
    console.log(`API response status: ${response.status}`);
    
    // Get the response data
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("API response data:", data);
        return NextResponse.json(data, { status: response.status });
      } else {
        const text = await response.text();
        console.log("API text response:", text);
        
        // If the response is empty but status is 200/204, return success
        if ((response.status === 200 || response.status === 204) && !text.trim()) {
          return NextResponse.json(
            { success: true, message: "Operation completed successfully" },
            { status: response.status }
          );
        }
        
        return new NextResponse(text, {
          status: response.status,
          headers: { 'Content-Type': contentType || 'text/plain' }
        });
      }
    } catch (e) {
      console.error("Error processing API response:", e);
      
      // If JSON parsing fails but status is 200/204, probably empty response
      if (response.status === 200 || response.status === 204) {
        return NextResponse.json(
          { success: true, message: "Operation completed successfully" },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { success: false, message: "Error processing API response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`API Proxy Error (${method}):`, error);
    
    return NextResponse.json(
      { success: false, message: `Error: ${error.message}` },
      { status: 500 }
    );
  }
}