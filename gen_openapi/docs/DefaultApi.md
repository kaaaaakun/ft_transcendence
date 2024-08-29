# TournamentApi.DefaultApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**matchesGet**](DefaultApi.md#matchesGet) | **GET** /matches | 試合の開始
[**scoresPut**](DefaultApi.md#scoresPut) | **PUT** /scores | スコアの更新
[**tournamentsGet**](DefaultApi.md#tournamentsGet) | **GET** /tournaments | トーナメントの表示
[**tournamentsPost**](DefaultApi.md#tournamentsPost) | **POST** /tournaments | トーナメントの作成



## matchesGet

> MatchResponse matchesGet()

試合の開始

次の試合の詳細を取得します。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.DefaultApi();
apiInstance.matchesGet((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**MatchResponse**](MatchResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## scoresPut

> ScoreResponse scoresPut(scoreRequest)

スコアの更新

試合中のプレイヤーのスコアを増加させます。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.DefaultApi();
let scoreRequest = new TournamentApi.ScoreRequest(); // ScoreRequest | 
apiInstance.scoresPut(scoreRequest, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **scoreRequest** | [**ScoreRequest**](ScoreRequest.md)|  | 

### Return type

[**ScoreResponse**](ScoreResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## tournamentsGet

> TournamentResponse tournamentsGet()

トーナメントの表示

試合からトーナメントに戻るためのAPI。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.DefaultApi();
apiInstance.tournamentsGet((error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**TournamentResponse**](TournamentResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## tournamentsPost

> TournamentResponse tournamentsPost(tournamentRequest)

トーナメントの作成

プレイヤーのリストを使用して新しいトーナメントを作成します。プレイヤーの数は2の累乗（例：2、4、8、16）でなければなりません。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.DefaultApi();
let tournamentRequest = new TournamentApi.TournamentRequest(); // TournamentRequest | 
apiInstance.tournamentsPost(tournamentRequest, (error, data, response) => {
  if (error) {
    console.error(error);
  } else {
    console.log('API called successfully. Returned data: ' + data);
  }
});
```

### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **tournamentRequest** | [**TournamentRequest**](TournamentRequest.md)|  | 

### Return type

[**TournamentResponse**](TournamentResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

