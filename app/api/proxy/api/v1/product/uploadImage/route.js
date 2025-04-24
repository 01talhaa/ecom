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
    
    // Forward the request to the actual API
    const apiUrl = `${process.env.BASE_URL}/api/v1/product/uploadImage`;
    
    console.log(`Forwarding image upload request to: ${apiUrl}`);
    
    // Send the request to the external API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        // Don't set Content-Type header for FormData
      },
      body: formData // Pass the formData directly
    });
    
    // Get the response data
    const responseData = await response.json();
    console.log("Upload API response:", responseData);
    
    // Return the API response - pass it through exactly as received
    return NextResponse.json(responseData, { 
      status: response.status 
    });
    
  } catch (error) {
    console.error('Error proxying image upload request:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing upload request: ' + error.message 
    }, { status: 500 });
  }
}