import '@/scss/styles.scss'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'

// const data = {
//   "login_name": "user1",
//   "display_name": "ユーザー1",
//   "avatar_path": "/superman_hero.png",
//   "num_of_friends": 3,
//   "performance": {
//     "game_records": [
//       {
//         "date": "2021-01-01T12:00:00Z",
//         "result": "win",
//         "opponent": "ユーザー2",
//         "score": {
//           "player": 10,
//           "opponent": 5
//         },
//         "match_type": "simple"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       },
//       {
//         "date": "2021-01-02T12:00:00Z",
//         "result": "loss",
//         "opponent": "ユーザー3",
//         "score": {
//           "player": 5,
//           "opponent": 10
//         },
//         "match_type": "tournament"
//       }
//     ],
//     "statistics": {
//       "total_games": 2,
//       "wins": 1,
//       "losses": 1,
//       "win_rate": 50
//     }
//   }
// }

  const handleSave = (displayName, setIsEditing) => {
    data.display_name = displayName; // `data` を更新
    setIsEditing(false); // 編集モードを終了
  };

const left = (isEditing, setIsEditing, data) => {
  return Teact.createElement(
    'div',
    { className: 'text-center' }, // 縦方向中央揃え
    Teact.createElement(
      'div',
      { className: 'relative w-32 h-32' }, // 左寄せ
      Teact.createElement(
        'label',
        { className: '' }, // クリック可能にする
        Teact.createElement('img', {
          src: data.avatar_path,
          className: 'img-fluid avatar', // 画像を丸くする
          alt: 'Avatar',
        }),
        'login_name' in data
        ? Teact.createElement('input', {
            type: 'file',
            accept: 'image/*',
            className: 'hidden', // input を非表示
            onChange: (e) => {},
          })
        : null
    )),
    Teact.createElement('p', null, `フレンド${data.num_of_friends}人`)
  );
};

const right = (isEditing, setIsEditing, data) => {
  return Teact.createElement(
    'div',
    { className: 'ps-3' }, // 縦方向中央揃え
    Teact.createElement(
      'div',
      { className: 'd-flex align-items-center' }, // 横並び
      Teact.createElement(
        'div',
        { className: '' },
        isEditing && 'login_name' in data
          ? Teact.createElement(
              'input',
              {
                type: 'text',
                className: 'form-control',
                value: data.display_name,
                onChange:(e) => handleSave(e.target.value, setIsEditing), // 入力値を更新
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
        isEditing && 'login_name' in data
        ? Teact.createElement(
          'div',
          { className: 'd-flex justify-content-center' },
            Teact.createElement(
              'button',
              {
                className: 'btn btn-success btn-sm align-items-center ms-2',
                onClick: () => setIsEditing(false), // 編集モード終了
              },
              'Save'
            ),
            Teact.createElement(
              'button',
              {
                className: 'btn btn-outline-secondary btn-sm align-items-center ms-2',
                onClick: () => setIsEditing(false), // 編集モード終了
              },
              'Cancel'
            )
          )
        : 'login_name' in data
          ? Teact.createElement(
              'button',
              {
                className: 'btn btn-outline-primary btn-sm align-items-center text-center',
                onClick: () => setIsEditing(true), // 編集モード開始
              },
              'Edit'
            )
          : null
        )
      ),
      'login_name' in data
      ? Teact.createElement(
          'div',
          { className: '' },
          Teact.createElement(
            'p',
            { className: 'fs-5 text-spacing m-auto' }, // ボーダーと少しの内側余白
            `${data.login_name}`
          )
        )
      : null
  );
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const gameRecord = (record, data) => {
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
  const [userData, setUserData] = Teact.useState(null);

  Teact.useEffect(() => {
    userApi.getProfile()
      .then(data => {
        setUserData(data);
      })
      .catch(error => console.error("Error fetching user profile:", error));
  }, []);
  console.log(userData);
  if (!userData) {
    return Teact.createElement("p", null, "Loading...");
  }
  return HeaderWithTitleLayout(
    Teact.createElement(
      'div',
      { className: 'container bg-white pb-3 pt-3' },
      Teact.createElement(
        'div',
        { className: 'd-flex align-items-center' },
        left(isEditing, setIsEditing, userData),
        right(isEditing, setIsEditing, userData)
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
          'div',
          { className: 'table-header' },
          Teact.createElement(
            'table',
            { className: 'table table-bordered table-striped mt-2' },
            Teact.createElement(
              'thead',
              null,
              Teact.createElement(
                'tr',
                { className: 'text-center' }, // Bootstrap グリッドを使用
                Teact.createElement('th', {className: 'width-35 border-end'}, 'Match'),
                Teact.createElement('th', {className: 'width-25 border-end'}, 'Date'),
                Teact.createElement('th', {className: 'width-10 border-end'}, 'Result'),
                Teact.createElement('th', {className: 'width-15 border-end'}, 'Score'),
                Teact.createElement('th', {className: 'width-15'}, 'Match Type')
              )
            ),
            Teact.createElement(
              'tbody',
              { className: 'table-body-scroll' },
              ...(userData?.performance?.game_records?.map(gameRecord, userData) || [])
            )
          )
        )
      )
    )
  );
};

