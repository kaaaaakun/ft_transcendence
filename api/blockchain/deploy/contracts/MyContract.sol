// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    // プレイヤー情報の構造体（ユーザーID、表示名と点数のセット）
    struct Player {
        string userId;      // UUIDを文字列として保存
        string displayName; // プレイヤーの表示名
        string score;       // プレイヤーの点数（文字列として保存）
    }
    
    // 試合結果の構造体
    struct MatchResult {
        string matchId;     // 試合ID（UUIDを文字列として保存）
        string matchTime;   // 試合時間（文字列として保存）
        Player player1;     // プレイヤー1の情報
        Player player2;     // プレイヤー2の情報
    }
    
    // 試合結果を保存するマッピング（matchId => MatchResult）
    mapping(string => MatchResult) public matchResults;
    
    // 試合結果が存在するかチェックするマッピング（Primary Key機能）
    mapping(string => bool) public matchExists;
    
    // 保存された試合の総数
    uint256 public totalMatches;
    
    // matchId一覧を管理する配列（Primary Key管理用）
    string[] public matchIdList;
    
    // イベント：試合結果が保存された時に発火
    event MatchResultStored(
        string indexed matchId,
        string matchTime,
        string userId1,
        string displayName1,
        string score1,
        string userId2,
        string displayName2,
        string score2
    );
    
    constructor() {
        totalMatches = 0;
    }
    
    // 試合結果を保存する関数
    function storeMatchResult(
        string memory _matchId,
        string memory _matchTime,
        string memory _userId1,
        string memory _displayName1,
        string memory _score1,
        string memory _userId2,
        string memory _displayName2,
        string memory _score2
    ) public {
        // Primary Key制約: matchIdの重複チェック
        require(!matchExists[_matchId], "Match ID already exists - Primary Key constraint violation");
        require(bytes(_matchId).length > 0, "Match ID cannot be empty - Primary Key cannot be null");
        require(bytes(_userId1).length > 0, "User ID 1 cannot be empty");
        require(bytes(_userId2).length > 0, "User ID 2 cannot be empty");
        require(bytes(_displayName1).length > 0, "Display name 1 cannot be empty");
        require(bytes(_displayName2).length > 0, "Display name 2 cannot be empty");
        
        Player memory player1 = Player({
            userId: _userId1,
            displayName: _displayName1,
            score: _score1
        });
        
        Player memory player2 = Player({
            userId: _userId2,
            displayName: _displayName2,
            score: _score2
        });
        
        matchResults[_matchId] = MatchResult({
            matchId: _matchId,
            matchTime: _matchTime,
            player1: player1,
            player2: player2
        });
        
        // Primary Key登録: matchIdを一意のキーとして登録
        matchExists[_matchId] = true;
        matchIdList.push(_matchId);
        totalMatches++;
        
        emit MatchResultStored(_matchId, _matchTime, _userId1, _displayName1, _score1, _userId2, _displayName2, _score2);
    }
    
    // 試合結果を取得する関数
    function getMatchResult(string memory _matchId) public view returns (
        string memory matchId,
        string memory matchTime,
        string memory userId1,
        string memory displayName1,
        string memory score1,
        string memory userId2,
        string memory displayName2,
        string memory score2
    ) {
        // Primary Key制約: 存在しないmatchIdへのアクセスを防ぐ
        require(matchExists[_matchId], "Match does not exist - Primary Key not found");
        
        MatchResult memory result = matchResults[_matchId];
        return (
            result.matchId,
            result.matchTime,
            result.player1.userId,
            result.player1.displayName,
            result.player1.score,
            result.player2.userId,
            result.player2.displayName,
            result.player2.score
        );
    }
    
    // Primary Key管理関数: 全てのmatchIdを取得
    function getAllMatchIds() public view returns (string[] memory) {
        return matchIdList;
    }
    
    // Primary Key管理関数: matchIdの存在確認
    function isMatchIdExists(string memory _matchId) public view returns (bool) {
        return matchExists[_matchId];
    }
    
    // Primary Key管理関数: 特定のインデックスのmatchIdを取得
    function getMatchIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < matchIdList.length, "Index out of bounds");
        return matchIdList[_index];
    }
}
