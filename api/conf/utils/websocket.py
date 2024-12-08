

def get_tournament_id_from_scope(scope):
    """
    WebSocketのscopeからトーナメントIDを取得する関数。
    クッキーをサポートし、IDを整数型に変換します。

    Args:
        scope (dict): WebSocketのscope情報。

    Returns:
        int or None: トーナメントID (存在しない場合はNone)
    """
    tournament_id = None
    for header in scope.get("headers", []):
        if header[0] == b"cookie":
            cookies = header[1].decode()
            cookie_parts = cookies.split("; ")
            for cookie in cookie_parts:
                if cookie.startswith("tournament_id="):
                    raw_id = cookie.split("=")[1]
                    try:
                        tournament_id = int(raw_id)  # 整数型に変換
                    except ValueError:
                        # 変換できない場合はエラーを避けてNoneのままにする
                        tournament_id = None
                    break

    return tournament_id

