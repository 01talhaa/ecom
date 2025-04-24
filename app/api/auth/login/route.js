import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Get the base URL from environment variables
    const baseUrl = process.env.BASE_URL || 'https://api.tratechbd.com';
    
    console.log(`Making login request to ${baseUrl}/api/v1/auth/login`);
    
    // Make the request to the external API
    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    // Log response status
    console.log(`Login API response status: ${response.status}`);
    
    // Check if the response is OK
    if (!response.ok) {
      // Try to get error details
      try {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        
        return NextResponse.json(
          { 
            success: false, 
            message: errorData.message || `Login failed: ${response.status}` 
          },
          { status: response.status }
        );
      } catch (parseError) {
        // If not JSON, get error text
        const errorText = await response.text();
        console.log("Error text:", errorText);
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Login failed: ${response.status}` 
          },
          { status: response.status }
        );
      }
    }
    
    // Get the response text first to check if it's valid JSON
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    // Only try to parse if we have content
    if (responseText.trim()) {
      try {
        const data = JSON.parse(responseText);
        console.log("Parsed response:", data);
        
        return NextResponse.json(data);
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid response format from server" 
          },
          { status: 500 }
        );
      }
    } else {
      console.log("Empty response from server");
      
      return NextResponse.json(
        { 
          success: false, 
          message: "Empty response from server" 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Login Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: `An error occurred: ${error.message}` 
      },
      { status: 500 }
    );
  }
}