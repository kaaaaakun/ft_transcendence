function setTournamentId(tournamentId) {
  document.cookie = 'tournament_id=${tournamentId}; path=/'
}

function deleteTournamentId() {
  document.cookie = 'tournament_id=; max-age=0; path=/'
}

function checkTournamentIdExists() {
  const cookieArr = document.cookie.split(';')

  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split('=')
    if (cookiePair[0].trim() === 'tournament_id') {
      return true // tournament_idが存在すればtrueを返す
    }
  }

  return false // tournament_idが存在しなければfalseを返す
}

function setJwtCookie() {
  document.cookie = 'jwt=jwt; path=/'
}

function deleteJwtCookie() {
  document.cookie = 'jwt=; max-age=0; path=/'
}


export const cookie = {
  setTournamentId,
  deleteTournamentId,
  checkTournamentIdExists,
  setJwtCookie,
  deleteJwtCookie,
}
