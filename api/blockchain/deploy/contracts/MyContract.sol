// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyContract {
    // プレイヤー情報の構造体（ユーザーIDと点数のセット）
    struct Player {
        string userId;      // UUIDを文字列として保存
        uint256 score;      // プレイヤーの点数
    }
    
    // 試合結果の構造体
    struct MatchResult {
        string matchId;     // 試合ID（UUIDを文字列として保存）
        uint256 matchTime;  // 試合時間（Unixタイムスタンプ）
        Player player1;     // プレイヤー1の情報
        Player player2;     // プレイヤー2の情報
    }
    
    // 試合結果を保存するマッピング（matchId => MatchResult）
    mapping(string => MatchResult) public matchResults;
    
    // 試合結果が存在するかチェックするマッピング
    mapping(string => bool) public matchExists;
    
    // 保存された試合の総数
    uint256 public totalMatches;
    
    // イベント：試合結果が保存された時に発火
    event MatchResultStored(
        string indexed matchId,
        uint256 matchTime,
        string userId1,
        uint256 score1,
        string userId2,
        uint256 score2
    );
    
    constructor() {
        totalMatches = 0;
    }
    
    // 試合結果を保存する関数
    function storeMatchResult(
        string memory _matchId,
        uint256 _matchTime,
        string memory _userId1,
        uint256 _score1,
        string memory _userId2,
        uint256 _score2
    ) public {
        require(!matchExists[_matchId], "Match ID already exists");
        require(bytes(_matchId).length > 0, "Match ID cannot be empty");
        require(bytes(_userId1).length > 0, "User ID 1 cannot be empty");
        require(bytes(_userId2).length > 0, "User ID 2 cannot be empty");
        
        Player memory player1 = Player({
            userId: _userId1,
            score: _score1
        });
        
        Player memory player2 = Player({
            userId: _userId2,
            score: _score2
        });
        
        matchResults[_matchId] = MatchResult({
            matchId: _matchId,
            matchTime: _matchTime,
            player1: player1,
            player2: player2
        });
        
        matchExists[_matchId] = true;
        totalMatches++;
        
        emit MatchResultStored(_matchId, _matchTime, _userId1, _score1, _userId2, _score2);
    }
    
    // 試合結果を取得する関数
    function getMatchResult(string memory _matchId) public view returns (
        string memory matchId,
        uint256 matchTime,
        string memory userId1,
        uint256 score1,
        string memory userId2,
        uint256 score2
    ) {
        require(matchExists[_matchId], "Match does not exist");
        
        MatchResult memory result = matchResults[_matchId];
        return (
            result.matchId,
            result.matchTime,
            result.player1.userId,
            result.player1.score,
            result.player2.userId,
            result.player2.score
        );
    }
}
