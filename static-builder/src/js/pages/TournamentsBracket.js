import '@/scss/styles.scss'
import { Teact } from '@/js/libs/teact'

export const TournamentsBracket = (members, tournamentType) => {
  function fillMembersWithWaiting(members, requiredCount) {
    const filledMembers = [...members]

    while (filledMembers.length < requiredCount) {
      filledMembers.push({
        player: {
          name: 'Waiting...',
        },
      })
    }

    return filledMembers
  }

  function sumVictoryCount(members, start, end) {
    return members
      .slice(start, end + 1)
      .reduce((sum, participant) => sum + participant.round, 0)
  }

  function getMostVictoriesParticipants(members) {
    return members.reduce((prev, current) =>
      prev.round > current.round ? prev : current,
    )
  }

  function createParticipantBoard(participant, x, y) {
    const xAdjustment = 5
    const yAdjustment = 12
    const textWidth = 110
    const textHeight = 20
    const nameTagColor = '#182F44'

    const isWaiting = participant.player.name === 'Waiting...'
    const fillColor = isWaiting ? '#666666' : nameTagColor
    const textColor = isWaiting ? '#cccccc' : 'white'

    return [
      Teact.createElement('rect', {
        x: x - xAdjustment,
        y: y - yAdjustment,
        width: textWidth,
        height: textHeight,
        fill: fillColor,
        stroke: 'white',
        'stroke-width': 0.5,
      }),
      Teact.createElement(
        'text',
        {
          x: x,
          y: y,
          'dominant-baseline': 'middle',
          'font-size': '12',
          fill: textColor,
          textLength: '100',
        },
        participant.player.name,
      ),
    ]
  }

  function createChampionParticipantBoard(members, tournamentEnd) {
    if (tournamentEnd) {
      const ret = createParticipantBoard(
        getMostVictoriesParticipants(members),
        173,
        10,
      )
      return ret
    }
    return []
  }
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO fix
  function TournamentFourParticipants(members, tournamentEnd) {
    return Teact.createElement(
      'div',
      { className: 'position-relative shift-up-200' },
      Teact.createElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          height: '100vh',
          viewBox: '-40,-30, 528,209',
          id: 'canvas',
          class: 'svg mx-auto p-2',
          width: '100%',
        },
        Teact.createElement('path', {
          d: 'M133,30 L165,30z',
          stroke: members[0].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[0], 2, 30),
        Teact.createElement('path', {
          d: 'M164,30 L164,45z',
          stroke: members[0].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,60 L165,60z',
          stroke: members[1].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[1], 2, 60),
        Teact.createElement('path', {
          d: 'M164,60 L164,45z',
          stroke: members[1].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M298,30 L266,30z',
          stroke: members[2].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[2], 329, 30),
        Teact.createElement('path', {
          d: 'M266,30 L266,45z',
          stroke: members[2].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M298,60 L266,60z',
          stroke: members[3].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[3], 329, 60),
        Teact.createElement('path', {
          d: 'M266,60 L266,45z',
          stroke: members[3].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M163,45 L215,45z',
          stroke: sumVictoryCount(members, 0, 1) > 3 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M215,45 L215,25z',
          stroke: sumVictoryCount(members, 0, 3) > 6 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M266,45 L215,45z',
          stroke: sumVictoryCount(members, 2, 3) > 3 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createChampionParticipantBoard(members, tournamentEnd),
      ),
    )
  }

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO fix
  function TournamentEightParticipants(members, tournamentEnd) {
    return Teact.createElement(
      'div',
      { className: 'position-relative shift-up-200' },
      Teact.createElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          height: '100vh',
          viewBox: '-40,-30, 528,209',
          id: 'canvas',
          class: 'svg mx-auto p-2',
          width: '100%',
        },
        Teact.createElement('path', {
          d: 'M133,30 L165,30z',
          stroke: members[0].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[0], 2, 30),
        Teact.createElement('path', {
          d: 'M164,30 L164,45z',
          stroke: members[0].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,60 L165,60z',
          stroke: members[1].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[1], 2, 60),
        Teact.createElement('path', {
          d: 'M164,60 L164,45z',
          stroke: members[1].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,90 L165,90z',
          stroke: members[2].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[2], 2, 90),
        Teact.createElement('path', {
          d: 'M164,90 L164,105z',
          stroke: members[2].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,120 L165,120z',
          stroke: members[3].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[3], 2, 120),
        Teact.createElement('path', {
          d: 'M164,120 L164,105z',
          stroke: members[3].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,30 L283,30z',
          stroke: members[4].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[4], 329, 30),
        Teact.createElement('path', {
          d: 'M284,30 L284,45z',
          stroke: members[4].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,60 L283,60z',
          stroke: members[5].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[5], 329, 60),
        Teact.createElement('path', {
          d: 'M284,60 L284,45z',
          stroke: members[5].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,90 L283,90z',
          stroke: members[6].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[6], 329, 90),
        Teact.createElement('path', {
          d: 'M284,90 L284,105z',
          stroke: members[6].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,120 L283,120z',
          stroke: members[7].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createParticipantBoard(members[7], 329, 120),
        Teact.createElement('path', {
          d: 'M284,120 L284,105z',
          stroke: members[7].round > 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M163,45 L195,45z',
          stroke: sumVictoryCount(members, 0, 1) > 2 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M194,45 L194,75z',
          stroke: sumVictoryCount(members, 0, 1) > 3 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M163,105 L195,105z',
          stroke: sumVictoryCount(members, 2, 3) > 2 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M194,105 L194,75z',
          stroke: sumVictoryCount(members, 2, 3) > 3 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M285,45 L253,45z',
          stroke: sumVictoryCount(members, 4, 5) > 2 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M254,45 L254,75z',
          stroke: sumVictoryCount(members, 4, 5) > 3 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M285,105 L253,105z',
          stroke: sumVictoryCount(members, 6, 7) > 2 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M254,105 L254,75z',
          stroke: sumVictoryCount(members, 6, 7) > 3 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M193,75 L225,75z',
          stroke: sumVictoryCount(members, 0, 3) > 7 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M224,75 L224,55z',
          stroke: sumVictoryCount(members, 0, 7) > 14 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M255,75 L223,75z',
          stroke: sumVictoryCount(members, 4, 7) > 7 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createChampionParticipantBoard(members, tournamentEnd),
      ),
    )
  }

  function ConditionalBranch(members, tournamentType) {
    console.log('ConditionalBranch component loaded, members:', members)
    console.log('Tournament type:', tournamentType)

    const filledMembers = fillMembersWithWaiting(
      members.members,
      tournamentType,
    )

    const tournamentEnd =
      sumVictoryCount(filledMembers, 0, filledMembers.length - 1) ===
      filledMembers.length - 1

    switch (tournamentType) {
      case 8:
        return TournamentEightParticipants(filledMembers, tournamentEnd)
      case 4:
        return TournamentFourParticipants(filledMembers, tournamentEnd)
      default:
        return Teact.createElement('h1', null, '400 Bad Request')
    }
  }
  return ConditionalBranch({ members }, tournamentType)
}
