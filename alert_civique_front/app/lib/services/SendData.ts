import { SERVER_BASE_URL } from '@/lib/config';
const BASE_URL = SERVER_BASE_URL;

async function sendData(url: string, body: any, token?: string) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  
  // Detailed logging
  console.log('SendData URL:', fullUrl);
  console.log('SendData body:', JSON.stringify(body, null, 2));
  if (token) console.log('SendData token present');
  
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log('SendData response status:', response.status);
    console.log('SendData response:', responseText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error("SendData error:", error);
    throw error;
  }
}

export default sendData;

