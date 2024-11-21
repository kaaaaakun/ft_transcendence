import json
from channels.generic.websocket import WebsocketConsumer

class MatchConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        try:
            # JSONをロードしてデータを取得
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message', 'No message provided')

            # クライアントにメッセージを返す
            self.send(text_data=json.dumps({
                'message': message
            }))
        except json.JSONDecodeError:
            # 受信データがJSONでない場合
            self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))