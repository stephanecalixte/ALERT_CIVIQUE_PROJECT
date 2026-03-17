const BASE_URL = "http://localhost:8082";

async function sendData(url: string, body: any) {
  // Ajoute l'URL de base si l'URL est relative
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur sendData :", error);
    return null;
  }
}

export default sendData;

