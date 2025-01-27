function setTournamentId(tournamentId) {
  document.cookie = 'tournament_id=${tournamentId}; path=/'
}

function deleteTournamentId() {
  document.cookie = 'tournament_id=; max-age=0; path=/'
}

function checkTournamentIdExists() {
  const cookieArr = document.cookie.split(';')

  for (const cookie of cookieArr) {
    const [key] = cookie.split('=')
    if (key.trim() === 'tournament_id') {
      return true // tournament_idが存在すればtrueを返す
    }
  }

  return false // tournament_idが存在しなければfalseを返す
}


export const cookie = {
  setTournamentId,
  deleteTournamentId,
  checkTournamentIdExists,
}
