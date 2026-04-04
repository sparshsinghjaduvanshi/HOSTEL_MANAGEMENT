export const getCoordinatesFromAddress = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }

  const cleanAddress = address.replace(/\n/g, " ").trim();

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cleanAddress)}&key=${process.env.OPENCAGE_API_KEY}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("API request failed");
    }

    const data = await res.json();

    if (!data.results.length) {
      throw new Error("Invalid address");
    }

    const { lat, lng } = data.results[0].geometry;

    return { lat, lng };

  } catch (error) {
    throw new Error("Failed to fetch coordinates");
  }
};