function setApiKey(key) {
  localStorage.setItem("api_key", key)
}

function getApiKey() {
  return localStorage.getItem("api_key")
}

function setFontStore(font) {
  localStorage.setItem("font", font)
}

function getFont() {
  return localStorage.getItem("font")
}

function setSortBy(id) {
  localStorage.setItem("sortby", id)
}

function getSortBy() {
  return localStorage.getItem("sortby")
}

/**
 * @param {boolean} combine 
 */
function setCombineStar(combine) {
  localStorage.setItem("combine-star", JSON.stringify(combine))
}

function getCombineStar() {
  if (localStorage.getItem("combine-star") == null) return false
  return JSON.parse(localStorage.getItem("combine-star"))
}