import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, confirmPassword, refUser, vendorName, contactPerson, vendorAddress, mobile } = body;
    
    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { status: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }
    
    // Get the base URL from environment variables
    const baseUrl = process.env.BASE_URL || 'https://api.tratechbd.com';
    
    console.log(`Making vendor registration request to ${baseUrl}/api/v1/auth/vendor_register`);
    
    // Make the request to the external API
    const response = await fetch(`${baseUrl}/api/v1/auth/vendor_register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email, 
        password, 
        confirmPassword, 
        refUser, 
        vendorName, 
        contactPerson, 
        vendorAddress, 
        mobile 
      }),
    });
    
    // Log response status
    console.log(`Vendor Registration API response status: ${response.status}`);
    
    // Check if the response is OK
    if (!response.ok) {
      // Try to get error details
      try {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        
        return NextResponse.json(
          { 
            status: false, 
            message: errorData.message || `Registration failed: ${response.status}` 
          },
          { status: response.status }
        );
      } catch (parseError) {
        // If not JSON, get error text
        const errorText = await response.text();
        console.log("Error text:", errorText);
        
        return NextResponse.json(
          { 
            status: false, 
            message: `Registration failed: ${response.status}` 
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
        
        return NextResponse.json({
          status: true,
          message: data.message || "Your login request is waiting for approval!"
        });
      } catch (jsonError) {
        console.error("Error parsing JSON:", jsonError);
        
        return NextResponse.json(
          { 
            status: false, 
            message: "Invalid response format from server" 
          },
          { status: 500 }
        );
      }
    } else {
      console.log("Empty response from server");
      
      return NextResponse.json(
        { 
          status: false, 
          message: "Empty response from server" 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Vendor Registration Error:', error);
    
    return NextResponse.json(
      { 
        status: false, 
        message: `An error occurred: ${error.message}` 
      },
      { status: 500 }
    );
  }
}