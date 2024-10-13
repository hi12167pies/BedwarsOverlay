const { ipcRenderer } = require("electron")

// Handles user interactions
const promptElement = document.getElementById("prompt")
const promptBackgroundElement = document.getElementById("prompt_background")

const apiKeyForm = document.getElementById("api_key")
const apiKeyInput = document.getElementById("api_key_input")
const closePromptButton = document.getElementById("close_prompt")

const statsTable = document.getElementById("stats")

/**
 * List of columns in the taable
 * id:   used to identify the column
 * name: shows in the gui
 * func: Returns a int for sorting
 * (Optional) sortable: If this field can be sorted, true by default 
 */
const columns = [
  {
    id: "name",
    name: "Username",
    sortable: false,
    func: (playerData, element, extra) => {
      let level = (playerData?.achievements?.bedwars_level) || 0

      let star = ""
      if (getCombineStar()) {
        star = parseMinecraftColors(getBedwarsStarColor(level)) + " "
      }

      if (playerData == null) {
        element.innerHTML = star + parseMinecraftColors("&7" + extra.name + " &4(NICK)")
        return
      }
      element.innerHTML =  star + parseMinecraftColors(getHypixelPrefix(playerData)) + " " + extra.name

      return 0
    }
  },
  {
    id: "star",
    name: "Stars",
    func: (playerData, element) => {
      let level = (playerData?.achievements?.bedwars_level) || 0

      element.innerHTML = parseMinecraftColors(getBedwarsStarColor(level))

      return level
    }
  },
  {
    id: "finals",
    name: "Finals",
    func: (playerData, element) => {
      const finals = (playerData?.stats?.Bedwars?.final_kills_bedwars) || 0
      element.innerText = finals.toLocaleString()
      return finals
    }
  },
  {
    id: "wins",
    name: "Wins",
    func: (playerData, element) => {
      const wins = (playerData?.stats?.Bedwars?.wins_bedwars )|| 0
      element.innerText = wins.toLocaleString()
      return wins
    }
  },
  {
    id: "fkdr",
    name: "FKDR",
    func: (playerData, element) => {
      let kills = (playerData?.stats?.Bedwars?.final_kills_bedwars) || 0
      let deaths = (playerData?.stats?.Bedwars?.final_deaths_bedwars) || 0
      let fkdr = kills / deaths

      if (isNaN(fkdr)) fkdr = 0

      let formatted = "&7"

      if (fkdr > 1) formatted = "&a"
      if (fkdr > 5) formatted = "&e"
      if (fkdr > 15) formatted = "&c"
      if (fkdr > 100) formatted = "&4"

      formatted += fkdr.toFixed(2)

      element.innerHTML = parseMinecraftColors(formatted)

      return fkdr
    }
  },
  {
    id: "wlr",
    name: "WLR",
    func: (playerData, element) => {
      let wins = (playerData?.stats?.Bedwars?.wins_bedwars) || 0
      let losses = (playerData?.stats?.Bedwars?.losses_bedwars) || 0
      let wlr = wins / losses

      if (isNaN(wlr)) wlr = 0

      let formatted = "&7"

      if (wlr > 0.4) formatted = "&a"
      if (wlr > 1) formatted = "&e"
      if (wlr > 3) formatted = "&c"
      if (wlr > 6) formatted = "&4"

      formatted += wlr.toFixed(2)

      element.innerHTML = parseMinecraftColors(formatted)

      return wlr
    }
  }
]

document.body.addEventListener("keypress", event => {
  if (event.key == ",") {
    if (promptElement.hidden) {
      promptApiKey()
    } else {
      closeApiKeyPrompt()
    }
  }
})

/**
 * Updates the window height to fit all the content
 */
function updateWindowHeight(height) {
  if (!promptElement.hidden && height == undefined) return
  ipcRenderer.send("resize-height", height || document.documentElement.getBoundingClientRect().height)
}

/**
 * Prompts user to set api key
 */
function promptApiKey() {
  promptElement.hidden = false
  promptBackgroundElement.hidden = false
  updateWindowHeight(500)
}

/**
 * Closes the api key prompt
 */
function closeApiKeyPrompt() {
  promptElement.hidden = true
  promptBackgroundElement.hidden = true
  apiKeyInput.value = ""
  updateWindowHeight()
}

/**
 * Resets the table and its data
 */
function resetTable(resetData = true) {
  statsTable.innerHTML = ""
  
  if (resetData) {
    usersOnTable = []
  }

  const tr = document.createElement("tr")

  tr.classList.add("title")

  columns.forEach(column => {
    if (getCombineStar() && column.id == "star") {
      return
    }
    const th = document.createElement("th")
    th.innerText = column.name
    tr.appendChild(th)
  })
  
  statsTable.appendChild(tr)

  updateWindowHeight()
}

let usersOnTable = []
/**
 * Adds a user to the table
 */
function addUserToTable(playerData, name) {
  usersOnTable.push({ playerData, name })
}

/**
 * Removes a player from the table
 */
function removePlayerFromTable(username) {
  const index = usersOnTable.findIndex(user => user.name.toLowerCase() == username.toLowerCase())
  usersOnTable.splice(index, 1)
}

/**
 * Renders the actual table
 */
function renderTable() {
  resetTable(false)

  const sortBy = columns.find(column => column.id == getSortBy())

  // Dummy element for the function
  const element = document.createElement("template")

  usersOnTable
    .sort((a, b) => {
      let aValue = 0, bValue = 0
      try {
        aValue = sortBy.func(a.playerData, element, { name: a.name })
      } catch (e) {
        console.log("Failed to sort A", a, e)
      }

      try {
        bValue = sortBy.func(b.playerData, element, { name: b.name })
      } catch (e) {
        console.log("Failed to sort B", b, e)
      }

      return bValue - aValue
    })  
    .forEach(({playerData, name}) => {
      renderUserToTable(playerData, name)
    })
  updateWindowHeight()
}

/**
 * Renders a user to the table
 * @param {any} playerData 
 */
function renderUserToTable(playerData, name) {
  const tr = document.createElement("tr")

  columns.forEach(column => {
    if (getCombineStar() && column.id == "star") {
      return
    }
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
  apiKeyInput.value = ""
})


if (getApiKey() == null) {
  promptApiKey()
}

resetTable()

// Font
const fontSelector = document.getElementById("font")

function updateFont() {
  if (getFont() == undefined) return
  document.documentElement.style.setProperty("--font", getFont())
  fontSelector.value = getFont()
}

fontSelector.addEventListener("change", event => {
  setFontStore(fontSelector.value)
  updateFont()
})

// Sort by
const sortBySelector = document.getElementById("sortby")

sortBySelector.addEventListener("change", () => {
  setSortBy(sortBySelector.value)
  renderTable()
})

columns.forEach(column => {
  // tripple equals must be accurate!
  if (column.sortable === false) return
  const element = document.createElement("option")
  element.value = column.id
  element.innerText = column.name
  sortBySelector.appendChild(element)
})

if (getSortBy() == undefined) {
  setSortBy("fkdr")
}
sortBySelector.value = getSortBy()

// Combine stars
const combineStarElement = document.getElementById("combine-star")

combineStarElement.addEventListener("click", () => {
  setCombineStar(combineStarElement.checked)
  renderTable()
})
combineStarElement.checked = getCombineStar()

// Final kill remove
const finalKillRemove = document.getElementById("final-kill-remove")
finalKillRemove.addEventListener("click", () => {
  setFinalKillRemove(finalKillRemove.checked)
  renderTable()
})
finalKillRemove.checked = getFinalKillRemove()

updateFont()
updateWindowHeight()