const BASE_URL = "http://localhost:8082";

async function sendData(url: string, body: any, token?: string) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  
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

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur sendData :", error);
    throw error;
  }
}

export default sendData;

