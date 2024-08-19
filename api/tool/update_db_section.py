# setting.pyのDATABASESセクションを更新するスクリプト

import os #環境変数でパスワードをなどを取得するときのために入れてある
import re

# settings.pyのパスを指定
settings_file = 'trans/settings.py'

# setting.pyのDATABASESセクションを以下に置き換える
database_config = """
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'pong_db',
        'USER': 'pong_user',
        'PASSWORD': 'pass',
        'HOST': 'db',
        'PORT': '5432',
    }
}
"""

# settings.pyの内容を読み込む
with open(settings_file, 'r') as file:
    settings_content = file.read()

# DATABASESセクションを探して置き換える
## 探したいパターン
pattern = r'DATABASES\s*=\s*{[^}]*\}\s*}'
## 検索と置き換え
new_settings_content = re.sub(pattern, database_config, settings_content, flags=re.DOTALL)

# 置き換え前後の内容が同じ場合（つまりDATABASEセクションがなかった）、新たにDATABASEセクションを追加
if settings_content == new_settings_content:
    new_settings_content += '\n' + database_config

# 更新された内容をsettings.pyに書き戻す
with open(settings_file, 'w') as file:
    file.write(new_settings_content)

print("settings.py has been updated.")
