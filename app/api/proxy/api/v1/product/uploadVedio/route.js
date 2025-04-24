import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the authorization header
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authorization header is missing' 
      }, { status: 401 });
    }
    
    // Clone the request to get the form data
    const formData = await request.formData();
    
    // Ensure BASE_URL is defined and use a fallback if not
    const baseUrl = process.env.BASE_URL || 'https://api.tratechbd.com';
    const apiUrl = `${baseUrl}/api/v1/product/uploadVedio`;
    
    console.log(`Forwarding video upload request to: ${apiUrl}`);
    
    // Send the request to the external API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        // Don't set Content-Type header for FormData
      },
      body: formData // Pass the formData directly
    });
    
    // Check for non-JSON responses
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      // Handle non-JSON response (text response)
      const textResponse = await response.text();
      console.log("API returned non-JSON response:", textResponse);
      
      return NextResponse.json({
        success: true,
        fileUrl: textResponse.trim()
      }, { status: 200 });
    }
    
    // Get the response data
    const responseData = await response.json();
    console.log("Upload API response:", responseData);
    
    // Return the API response - pass it through exactly as received
    return NextResponse.json(responseData, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('Error proxying video upload request:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing upload request: ' + error.message 
    }, { status: 500 });
  }
}