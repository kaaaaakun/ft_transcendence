# TournamentApi.LocalPlayApi

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**apiMatchesLocalGet**](LocalPlayApi.md#apiMatchesLocalGet) | **GET** /api/matches/local | 試合の開始
[**apiMatchesLocalScorePatch**](LocalPlayApi.md#apiMatchesLocalScorePatch) | **PATCH** /api/matches/local/score | スコアの更新
[**apiTournamentsLocalGet**](LocalPlayApi.md#apiTournamentsLocalGet) | **GET** /api/tournaments/local | トーナメントの表示
[**apiTournamentsLocalPost**](LocalPlayApi.md#apiTournamentsLocalPost) | **POST** /api/tournaments/local | トーナメントの作成



## apiMatchesLocalGet

> MatchStatus apiMatchesLocalGet()

試合の開始

次の試合の詳細を取得します。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.LocalPlayApi();
apiInstance.apiMatchesLocalGet((error, data, response) => {
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

[**MatchStatus**](MatchStatus.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json


## apiMatchesLocalScorePatch

> MatchStatus apiMatchesLocalScorePatch(score)

スコアの更新

試合中のプレイヤーのスコアを増加させます。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.LocalPlayApi();
let score = new TournamentApi.Score(); // Score | 
apiInstance.apiMatchesLocalScorePatch(score, (error, data, response) => {
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
 **score** | [**Score**](Score.md)|  | 

### Return type

[**MatchStatus**](MatchStatus.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json


## apiTournamentsLocalGet

> TournamentResponse apiTournamentsLocalGet()

トーナメントの表示

試合からトーナメントに戻るためのAPI。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.LocalPlayApi();
apiInstance.apiTournamentsLocalGet((error, data, response) => {
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


## apiTournamentsLocalPost

> TournamentResponse apiTournamentsLocalPost(tournamentRequest)

トーナメントの作成

プレイヤーのリストを使用して新しいトーナメントを作成します。プレイヤーの数は2の累乗（例：2、4、8、16）でなければなりません。

### Example

```javascript
import TournamentApi from 'tournament_api';

let apiInstance = new TournamentApi.LocalPlayApi();
let tournamentRequest = new TournamentApi.TournamentRequest(); // TournamentRequest | 
apiInstance.apiTournamentsLocalPost(tournamentRequest, (error, data, response) => {
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

