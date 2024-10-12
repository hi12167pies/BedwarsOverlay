// Handles user interactions
const promptElement = document.getElementById("prompt")
const promptBackgroundElement = document.getElementById("prompt_background")

const apiKeyForm = document.getElementById("api_key")
const apiKeyInput = document.getElementById("api_key_input")
const closePromptButton = document.getElementById("close_prompt")

const statsTable = document.getElementById("stats")
const columns = [
  {
    name: "Username",
    func: (playerData, element, extra) => {
      if (playerData == null) {
        element.innerHTML = parseMinecraftColors("&7" + extra.name + " &4(NICK)")
        return
      }
      element.innerHTML = parseMinecraftColors(getHypixelPrefix(playerData)) + " " + extra.name
    }
  },
  {
    name: "Stars",
    func: (playerData, element) => {
      let level = playerData.achievements?.bedwars_level
      level = level || 0

      element.innerHTML = parseMinecraftColors(getBedwarsStarColor(level))
    }
  },
  {
    name: "Finals",
    func: (playerData, element) => {
      element.innerText = playerData.stats.Bedwars.final_kills_bedwars || 0
    }
  },
  {
    name: "Wins",
    func: (playerData, element) => {
      element.innerText = playerData.stats.Bedwars.wins_bedwars || 0
    }
  },
  {
    name: "FKDR",
    func: (playerData, element) => {
      let kills = playerData.stats.Bedwars.final_kills_bedwars || 0
      let deaths = playerData.stats.Bedwars.final_deaths_bedwars || 0
      let fkdr = kills / deaths

      let formatted = "&7"

      if (fkdr > 1) formatted = "&a"
      if (fkdr > 5) formatted = "&e"
      if (fkdr > 15) formatted = "&c"
      if (fkdr > 100) formatted = "&4"

      formatted += isNaN(fkdr) ? "0" : fkdr.toFixed(2)

      element.innerHTML = parseMinecraftColors(formatted)
    }
  },
  {
    name: "WLR",
    func: (playerData, element) => {
      let wins = playerData.stats.Bedwars.wins_bedwars || 0
      let losses = playerData.stats.Bedwars.losses_bedwars || 0
      let wlr = wins / losses

      let formatted = "&7"

      if (wlr > 0.4) formatted = "&a"
      if (wlr > 1) formatted = "&e"
      if (wlr > 3) formatted = "&c"
      if (wlr > 6) formatted = "&4"

      formatted += isNaN(wlr) ? "0" : wlr.toFixed(2)

      element.innerHTML = parseMinecraftColors(formatted)
    }
  }
]

document.body.addEventListener("keypress", event => {
  if (event.key == ",") {
    promptApiKey()
  }
})

/**
 * Prompts user to set api key
 */
function promptApiKey() {
  promptElement.hidden = false
  promptBackgroundElement.hidden = false
}

/**
 * Closes the api key prompt
 */
function closeApiKeyPrompt() {
  promptElement.hidden = true
  promptBackgroundElement.hidden = true
  apiKeyInput.value = ""
}

/**
 * Resets the table and its data
 */
function resetTable() {
  statsTable.innerHTML = ""

  const tr = document.createElement("tr")

  tr.classList.add("title")

  columns.forEach(column => {
    const th = document.createElement("th")
    th.innerText = column.name
    tr.appendChild(th)
  })
  
  statsTable.appendChild(tr)
}

/**
 * Adds a user to the table
 * @param {any} playerData 
 */
function addUserToTable(playerData, name) {
  const tr = document.createElement("tr")

  columns.forEach(column => {
    const td = document.createElement("td")
    try {
      column.func(playerData, td, { name })
    } catch (e) {
      console.error("Error in column " + column.name, e)
      td.innerText = "-"
    }
    tr.appendChild(td)
  })

  statsTable.appendChild(tr)
}

closePromptButton.addEventListener("click", () => {
  closeApiKeyPrompt()
})

apiKeyForm.addEventListener("submit", event => {
  event.preventDefault()

  setApiKey(apiKeyInput.value)
})


if (getApiKey() == null) {
  promptApiKey()
}

resetTable()