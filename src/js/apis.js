/**
 * Dashses a UUID
 * @param {string} uuid 
 * @returns Dashed UUID
 */
function dashUUID(uuid) {
  return uuid.slice(0, 8) + "-" + uuid.slice(8, 12) + "-" + uuid.slice(12, 16) + "-" + uuid.slice(16, 20) + "-" + uuid.slice(20);
}

/**
 * Uses Mojang API to convert usernames to UUIDs.
 * @param {string[]} usernames - List of Minecraft usernames.
 * @returns {Promise<object[]>} - Array of username-UUID mappings.
 */
async function usernamesToUUID(usernames) {
  const chunkSize = 10;

  const chunks = [];
  for (let i = 0; i < usernames.length; i += chunkSize) {
    chunks.push(usernames.slice(i, i + chunkSize));
  }

  const fetchChunk = async (chunk) => {
    const res = await fetch("https://api.mojang.com/profiles/minecraft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(chunk),
    })

    const json = await res.json()
    return json.map((item) => ({
      name: item.name,
      id: dashUUID(item.id),
    }))
  }

  const results = await Promise.all(chunks.map(fetchChunk))
  return results.flat()
}

/**
 * Uses hypixel api to get players stats
 * @param {string} uuid
 */
async function getHypixelStats(uuid) {
  const res = await fetch("https://api.hypixel.net/v2/player?uuid=" + uuid, {
    headers: {
      "API-Key": getApiKey()
    }
  })
  const json = res.json()
  return json
}