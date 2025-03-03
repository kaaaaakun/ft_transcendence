import '@/scss/styles.scss'
import { HeaderWithTitleLayout } from '@/js/layouts/HeaderWithTitleLayout'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'

export const UserProfile = () => {
  const [isEditing, setIsEditing] = Teact.useState(false);
  const [userData, setUserData] = Teact.useState(null);
  let changeUserName = '';

  const handleAvatarChange = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('avatar_path', event.target.files[0]);
    try {
      const response = await userApi.changeProfile("test_user1", formData);
      console.log(response);
      setUserData(prevUserData => ({
        ...prevUserData,
        avatar_path: response.avatar_path,
    }));
    } catch (error) {
        console.error("アップロードエラー:", error);
    }
  };

  const handleSave = async () => {
    if (!changeUserName) {
      return;
    }
    try {
      const response = await userApi.changeProfile("test_user1", { display_name: changeUserName });
      console.log(response);
      setUserData(prevUserData => ({
        ...prevUserData,
        display_name: response.display_name,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("保存エラー:", error);
    }
  };

  const left = (isEditing, setIsEditing) => {
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
            src: `${userData.avatar_path}?${new Date().getTime()}`, // キャッシュ対策
            className: 'img-fluid avatar', // 画像を丸くする
            alt: 'Avatar',
          }),
          'login_name' in userData
          ? Teact.createElement('input', {
              type: 'file',
              accept: 'image/*',
              className: 'hidden', // input を非表示
              onChange: handleAvatarChange,
            })
          : null
      )),
      Teact.createElement('p', null, `フレンド${userData.num_of_friends}人`)
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
          isEditing && 'login_name' in userData
            ? Teact.createElement(
                'input',
                {
                  type: 'text',
                  className: 'form-control',
                  value: userData.display_name,
                  onChange:(e) => changeUserName = e.target.value, // 入力値を更新
                }
              )
            : Teact.createElement(
                'h1',
                { className: 'text-spacing m-auto' },
                userData.display_name
              ),
            ),
        Teact.createElement(
          'div',
          null,
          isEditing && 'login_name' in userData
          ? Teact.createElement(
            'div',
            { className: 'd-flex justify-content-center' },
              Teact.createElement(
                'button',
                {
                  className: 'btn btn-success btn-sm align-items-center ms-2',
                  onClick: () => handleSave(), // プロフィール更新
                },
                'Save'
              ),
              Teact.createElement(
                'button',
                {
                  className: 'btn btn-outline-secondary btn-sm align-items-center ms-2',
                  onClick: () => {setIsEditing(false);
                                  changeUserName = '';
                                }, // 編集モード終了
                },
                'Cancel'
              )
            )
          : 'login_name' in userData
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
        'login_name' in userData
        ? Teact.createElement(
            'div',
            { className: '' },
            Teact.createElement(
              'p',
              { className: 'fs-5 text-spacing m-auto' }, // ボーダーと少しの内側余白
              `${userData.login_name}`
            )
          )
        : null
    );
  };

  const gameRecord = (record) => {
    return Teact.createElement(
      'tr',
      { className: 'text-center' }, // Bootstrap グリッドを使用
      Teact.createElement('td', { className: 'width-35 border-end' }, `${userData.display_name} vs ${record.opponent_name}`),
      // Teact.createElement('td', { className: 'width-25 border-end' }, formatDate(record.date)),
      Teact.createElement('td', { className: 'width-10 border-end' }, record.result),
      Teact.createElement('td', { className: 'width-15 border-end' }, `${record.score.player} - ${record.score.opponent}`),
      Teact.createElement('td', { className: 'width-15' }, record.match_type)
    );
  };

  Teact.useEffect(() => {
    const userName = window.location.pathname.split('/').filter(Boolean).pop();
    userApi.getProfile(userName)
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
                // Teact.createElement('th', {className: 'width-25 border-end'}, 'Date'),
                Teact.createElement('th', {className: 'width-10 border-end'}, 'Result'),
                Teact.createElement('th', {className: 'width-15 border-end'}, 'Score'),
                Teact.createElement('th', {className: 'width-15'}, 'Match Type')
              )
            ),
            Teact.createElement(
              'tbody',
              { className: 'table-body-scroll' },
              ...(userData?.performance?.game_records?.map(record => gameRecord(record)) || [])
            )
          )
        )
      )
    )
  );
};

