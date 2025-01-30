import '@/scss/styles.scss'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'

const data = {
  "login_name": "user1",
  "display_name": "ユーザー1",
  "avatar_path": "/superman_hero.png",
  "num_of_friends": 3,
  "performance": {
    "game_records": [
      {
        "date": "2021-01-01T12:00:00Z",
        "result": "win",
        "opponent": "ユーザー2",
        "score": {
          "player": 10,
          "opponent": 5
        },
        "match_type": "simple"
      },
      {
        "date": "2021-01-02T12:00:00Z",
        "result": "loss",
        "opponent": "ユーザー3",
        "score": {
          "player": 5,
          "opponent": 10
        },
        "match_type": "tournament"
      }
    ],
    "statistics": {
      "total_games": 2,
      "wins": 1,
      "losses": 1,
      "win_rate": 50
    }
  }
}

const left = () => {
  return Teact.createElement(
    'div',
    { className: 'text-center' }, // 左寄せ
    Teact.createElement('img', {
      src: data.avatar_path,
      className: 'img-fluid avatar',
      alt: 'Avatar',
    }),
    Teact.createElement('p', null, `フレンド${data.num_of_friends}人`)
  );
};

const right = (isEditing, setIsEditing) => {
  return Teact.createElement(
    'div',
    { className: 'ps-3' }, // 縦方向中央揃え
    Teact.createElement(
      'div',
      { className: 'd-flex align-items-center' }, // 横並び
      Teact.createElement(
        'div',
        { className: '' },
        isEditing
          ? Teact.createElement(
              'input',
              {
                type: 'text',
                className: 'form-control',
                value: data.display_name,
                onChange: (e) => setDisplayName(e.target.value), // 入力値を更新
              }
            )
          : Teact.createElement(
              'h1',
              { className: 'text-spacing m-auto' },
              data.display_name
            ),
          ),
      Teact.createElement(
        'div',
        null,
        isEditing
        ? Teact.createElement(
            'button',
            {
              className: 'btn btn-success btn-sm align-items-center',
              onClick: () => setIsEditing(false), // 編集モード終了
            },
            'Save'
          )
        : Teact.createElement(
            'button',
            {
              className: 'btn btn-outline-primary btn-sm align-items-center text-center',
              onClick: () => setIsEditing(true), // 編集モード開始
            },
            'Edit'
          )
        )
      ),
      Teact.createElement(
        'div',
        { className: '' },
        Teact.createElement(
          'p',
          { className: 'fs-5 text-spacing m-auto' }, // ボーダーと少しの内側余白
          `${data.login_name}`
        )
      ),
  );
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const gameRecord = (record) => {
  return Teact.createElement(
    'tr',
    { className: 'text-center' }, // Bootstrap グリッドを使用
    Teact.createElement('td', { className: 'width-35 border-end' }, `${data.display_name} vs ${record.opponent}`),
    Teact.createElement('td', { className: 'width-25 border-end' }, formatDate(record.date)),
    Teact.createElement('td', { className: 'width-10 border-end' }, record.result),
    Teact.createElement('td', { className: 'width-15 border-end' }, `${record.score.player} - ${record.score.opponent}`),
    Teact.createElement('td', { className: 'width-15' }, record.match_type)
  );
};


export const UserProfile = () => {
  const [isEditing, setIsEditing] = Teact.useState(false);
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container bg-white pb-3 pt-3' },
      Teact.createElement(
        'div',
        { className: 'd-flex align-items-center' },
        left(),
        right(isEditing, setIsEditing)
      ),
      Teact.createElement(
        'div',
        { className: 'container mt-3' },
        Teact.createElement(
          'h2',
          { className: 'text-secondary fs-6' },
          'Game Records'
        ),
        Teact.createElement(
          'table',
          { className: 'table table-bordered table-striped mt-2' },
          Teact.createElement(
            'thead',
            null,
            Teact.createElement(
              'tr',
              { className: 'text-center' }, // Bootstrap グリッドを使用
              Teact.createElement('th', null, 'Match'),
              Teact.createElement('th', null, 'Date'),
              Teact.createElement('th', null, 'Result'),
              Teact.createElement('th', null, 'Score'),
              Teact.createElement('th', null, 'Match Type')
            )
          ),
          Teact.createElement(
            'tbody',
            null,
            ...data.performance.game_records.map(gameRecord)
          )
        )
      )
    )
  );
};

