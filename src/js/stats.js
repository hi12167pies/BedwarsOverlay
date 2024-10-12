const fs = require("fs")
const path = require("path")

let home = process.env.HOME
if (home == undefined && process.env.HOMEPATH) {
  home = process.env.HOMEDRIVE + process.env.HOMEPATH
}
const logDirectory = path.join(home, ".lunarclient", "logs/game")

/**
 * Loads the stats of the users
 * @param {string[]} users 
 */
async function loadStats(usernames) {
  resetTable()

  const users = await usernamesToUUID(usernames)

  let promises = []
  users.forEach(async user => {
    let promise = getHypixelStats(user.id)
    promises.push(promise)
    user.stats = (await promise).player
  })

  // Wait for all promises to complete
  await Promise.all(promises)

  usernames.forEach(usernameUnknown => {
    // The current username is unknown about the caps of it, this will get correct from mojang
    let username = users.find(user => user.name.toLowerCase() == usernameUnknown.toLowerCase())
    if (username == undefined) {
      username = usernameUnknown
    } else {
      username = username.name
    }

    const user = users.find(user => user.name.toLowerCase() == username.toLowerCase())
    if (user == undefined) {
      addUserToTable(null, username)
      return
    }
    addUserToTable(user.stats, username)
  })

  renderTable()
}

/**
 * Finds the latest log in the log directory
 */
function findLatestLog() {
  const logs = fs.readdirSync(logDirectory)

  let stats = []

  for (const logName of logs) {
    const logPath = path.join(logDirectory, logName)
    const stat = fs.statSync(logPath)
    stats.push({ path: logPath, stat })
  }

  // Sort first to last
  stats.sort((b, a) => {
    return a.stat.atime - b.stat.atime
  })

  return stats[0]
}

/**
 * Watches the log for changes
 * @param {string} log 
 */
function watchLog(log) {
  let lastSize = log.stat.size
  fs.watch(log.path, async (event, fileName) => {
    if (event != "change") return
    let newSize = fs.statSync(log.path).size
    let sizeDiff = newSize - lastSize

    // Only read new contents
    const buffer = Buffer.alloc(sizeDiff)
    
    const fd = fs.openSync(log.path)
    fs.readSync(fd, buffer, 0, sizeDiff, lastSize)
    fs.closeSync(fd)

    const parsedLogs = parseLog(buffer.toString())
      .filter(log => log.chatMessage != null) // Only get chat messages
    
    handleChatLogs(parsedLogs.map(log => log.chatMessage))

    lastSize = newSize
  })
}

const MESSAGE_COMMAND_PREFIX = "Can't find a player by the name of '"
const ONLINE_PLAYERS_PREFIX = "ONLINE: "
/**
 * Handles parsed logs
 */
function handleChatLogs(parsedLogs) {
  const online = parsedLogs
    .filter(log => log.startsWith(ONLINE_PLAYERS_PREFIX)) // Filter online
    .at(-1) // Get last
  
  if (online != undefined) {
    const users = online.slice(ONLINE_PLAYERS_PREFIX.length).split(", ")

    loadStats(users)
  }

  // Handle commands
  parsedLogs
    .filter(log => log.startsWith(MESSAGE_COMMAND_PREFIX))
    .map(log => log.slice(MESSAGE_COMMAND_PREFIX.length, -1))
    .forEach(async command => {
      // Clear command
      if (["c", "cl"].includes(command.toLowerCase())) {
        resetTable()
        return
      }

      // Add player command
      if (command.startsWith("!")) {
        const username = command.slice(1)
        const user = (await usernamesToUUID([username]))[0]
        const stats = await getHypixelStats(user.id)
        addUserToTable(stats.player, user.name)
      }

      renderTable()
    })
}

/**
 * Parses the log into a object
 * @param {string} data 
 * @returns A list of parsed logs
 */
function parseLog(data) {
  return data.split("\n")
    .map(log => log.trimEnd())
    .map(entry => {
      // Chatgpt
      const timestampMatch = entry.match(/\[(.*?)\]/)
      const levelMatch = entry.match(/\[(info|warn|error)\]/)
      const threadMatch = entry.match(/\[Client thread\/(.*?)\]/)
      const chatMessageMatch = entry.match(/:\s*\[CHAT\]\s*(.*)$/)

      return {
        timestamp: timestampMatch ? timestampMatch[1] : null,
        level: levelMatch ? levelMatch[1] : null,
        thread: threadMatch ? threadMatch[1] : null,
        chatMessage: chatMessageMatch ? chatMessageMatch[1].trim() : null
      }
    })
}

// Watch the latest log for changes
const latestLog = findLatestLog()
watchLog(latestLog)