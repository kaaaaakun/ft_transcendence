function setTournamentID(tournament_id) {
  document.cookie = `tournament_id=${tournament_id}; path=/`
}

function deleteTournamentID() {
  document.cookie = `tournament_id=; max-age=0; path=/`
}

function checkTournamentIdExists() {
  let cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if (cookiePair[0].trim() === "tournament_id") {
      return true; // tournament_idが存在すればtrueを返す
    }
  }

  return false; // tournament_idが存在しなければfalseを返す
}

export const cookie = {
  setTournamentID,
  deleteTournamentID,
  checkTournamentIdExists,
}
