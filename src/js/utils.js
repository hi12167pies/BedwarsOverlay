const bukkitToMinecraftColourMap = {
  BLACK: '&0',        // Black
  DARK_BLUE: '&1',    // Dark Blue
  DARK_GREEN: '&2',    // Dark Green
  DARK_AQUA: '&3',    // Dark Cyan
  DARK_RED: '&4',     // Dark Red
  DARK_PURPLE: '&5',  // Dark Magenta
  GOLD: '&6',         // Gold
  GRAY: '&7',         // Gray
  DARK_GRAY: '&8',    // Dark Gray
  BLUE: '&9',         // Blue
  GREEN: '&a',        // Green
  AQUA: '&b',         // Cyan
  RED: '&c',          // Red
  LIGHT_PURPLE: '&d', // Magenta
  YELLOW: '&e',       // Yellow
  WHITE: '&f',        // White
  MAGIC: '&k',        // Obfuscated
  BOLD: '&l',         // Bold
  STRIKETHROUGH: '&m',// Strikethrough
  UNDERLINE: '&n',    // Underline
  ITALIC: '&o',       // Italic
  RESET: '&r',        // Reset
}

const colourCodes = {
  '&0': '#000000', // Black
  '&1': '#0000AA', // Dark Blue
  '&2': '#00AA00', // Dark Green
  '&3': '#00AAAA', // Dark Cyan
  '&4': '#AA0000', // Dark Red
  '&5': '#AA00AA', // Dark Magenta
  '&6': '#FFAA00', // Gold
  '&7': '#AAAAAA', // Gray
  '&8': '#555555', // Dark Gray
  '&9': '#5555FF', // Blue
  '&a': '#55FF55', // Green
  '&b': '#55FFFF', // Cyan
  '&c': '#FF5555', // Red
  '&d': '#FF55FF', // Magenta
  '&e': '#FFFF55', // Yellow
  '&f': '#FFFFFF', // White
}

/**
 * Parses minecraft colour codes to html elements
 * This function is ChatGPT generated.
 * @param {string} text
 */
function parseMinecraftColors(text) {
  const regex = /&([0-9a-f])/g;

  return text.replace(regex, (match, code) => {
      const color = colourCodes[`&${code}`] || '#000000'; // Default to black if not found
      return `<span style="color: ${color};">`;
  }).replace(/([^<]*?)<\/span>/g, '$1</span>').replace(/<\/span>(?=\s*<span)/g, '');
}


/**
 * Gets the rank based on the player data
 * P.S Hypixel api sucks
 * @param {any} playerData 
 */
function getHypixelRank(playerData) {
  let rank = "DEFAULT"

  // Special ranks, "YOUTUBER", "ADMIN" etc.//
  if (playerData.rank) {
    rank = playerData.rank
  // Recurring ranks (MVP++)
  } else if (playerData.monthlyPackageRank && playerData.monthlyPackageRank != "NONE") {
    rank = playerData.monthlyPackageRank
  // Post-EULA ranks?
  } else if (playerData.newPackageRank) {
    rank = playerData.newPackageRank
  // Pre-EULA ranks?
  } else if (playerData.packageRank) {
    rank = playerData.packageRank
  }

  // Fix _PLUS
  rank = rank.replaceAll("_PLUS", "+")

  // WTF????
  if (rank == "SUPERSTAR") {
    rank = "MVP++"
  }

  return rank
}

/**
 * Gets the prefix of the player from the player data
 * @param {any} playerData 
 */
function getHypixelPrefix(playerData) {
  const rank = getHypixelRank(playerData)
  if (playerData.prefix) {
    return playerData.prefix.replaceAll("§", "&")
  }

  switch (rank) {
    case "DEFAULT":
      return "&7"
    case "VIP":
      return "&a[VIP]"
    case "VIP+":
      return "&a[VIP&6+&a]"
    case "MVP":
      return "&b[MVP]"
    case "MVP+":
    case "MVP++":
      let plusColour = bukkitToMinecraftColourMap[playerData.rankPlusColor] || "&c"
      return rank == "MVP+" ? `&b[MVP${plusColour}+&b]` : `&6[MVP${plusColour}++&6]`
    case "YOUTUBER":
      return "&c[&fYOUTUBE&c]"
    case "GAME_MASTER":
      return "&2[GM]"
    case "ADMIN":
      return "&c[ADMIN]"
    case "OWNER":
      return "&c[OWNER]"
  }

  return "&7"
}

/**
 * Adds colour to bedwars level
 */
function getBedwarsStarColor(level) {
  let colorCode;

  const prestige = Math.floor(level / 100);

  if (prestige >= 10) {
    const rainbowColors = ['&6', '&e', '&a', '&b']

    const chars = level.toString().split("")
    
    let colourStar = chars.map((char, i) => {
      return rainbowColors[i % chars.length] + char
    }).join("")

    return `&c[${colourStar}&d✫&5]` 
  }

  switch (prestige) {
    case 0: colorCode = '&7'; break;
    case 1: colorCode = '&f'; break;
    case 2: colorCode = '&6'; break;
    case 3: colorCode = '&b'; break;
    case 4: colorCode = '&2'; break;
    case 5: colorCode = '&3'; break;
    case 6: colorCode = '&4'; break;
    case 7: colorCode = '&d'; break;
    case 8: colorCode = '&9'; break;
    case 9: colorCode = '&5'; break;
    default: colorCode = '&6';
  }

  return `${colorCode}[${level}✫]`
}