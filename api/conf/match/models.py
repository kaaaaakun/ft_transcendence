from django.db import models
from django.db.models import Max
from tournament.models import Tournament, TournamentPlayer
from user.models import User

MATCH_TX_STATUS_CHOICES = [
    ('pending','pending'), 
    ('success', 'success'), 
    ('failure', 'failure')
]

class Match(models.Model):
    tournament = models.ForeignKey(
        Tournament, 
        on_delete = models.CASCADE, 
        null = True
    )
    created_at = models.DateTimeField(auto_now_add = True)
    is_finished = models.BooleanField(default = False)
    tx_status = models.CharField(
        max_length = 8,
        choices = MATCH_TX_STATUS_CHOICES,
        null = True,
        blank = True
    )
    tx_address = models.CharField(
        max_length = 100, 
        null = True,
        blank = True    
    )

    class Meta:
        db_table = 'matches'

    @classmethod
    def create_for_tournament(cls, tournament):
        if tournament.is_finished:
            raise ValueError("Cannot create a match for a finished tournament.")
        return cls.objects.create(tournament = tournament)

    @classmethod
    def update_is_finished(cls, match):
        match.is_finished = True
        match.save()
        return match

    @classmethod
    def update_tx_status(cls, match, status):
        match.tx_status = status
        match.full_clean()
        match.save()
        return match

    @classmethod
    def update_tx_address(cls, match, address):
        match.tx_address = address
        match.save()
        return match

    @classmethod
    def initialize_first_round_matches(cls, tournament):
        """
        トーナメントの最初のラウンドのマッチとマッチ詳細を作成する
        """
        if tournament.is_finished:
            raise ValueError("Cannot initialize matches for a finished tournament.")
        
        # エントリーナンバー順にトーナメントプレイヤーを取得
        tournament_players = TournamentPlayer.objects.filter(
            tournament=tournament
        ).order_by('entry_number')
        
        # プレイヤー数の確認
        player_count = tournament_players.count()
        if player_count != tournament.type:
            raise ValueError(f"Expected {tournament.type} players, but found {player_count} players.")
        
        # プレイヤー数が偶数でない場合はエラー
        if player_count % 2 != 0:
            raise ValueError("Player count must be even to create matches.")
        
        created_matches = []
        
        # 隣接するプレイヤー同士でマッチを作成
        for i in range(0, player_count, 2):
            player1 = tournament_players[i]
            player2 = tournament_players[i + 1]
            
            # マッチを作成
            match = cls.create_for_tournament(tournament)
            created_matches.append(match)
            
            # 各プレイヤーのマッチ詳細を作成
            MatchDetail.create(match, player1.user)
            MatchDetail.create(match, player2.user)
        
        return created_matches

    @classmethod
    def create_next_round_matches(cls, tournament):
        """
        次のラウンドのマッチとマッチ詳細を作成する
        各ブロックで勝者が出揃った時点でマッチを作成する
        """
        if tournament.is_finished:
            raise ValueError("Cannot create matches for a finished tournament.")
        
        created_matches = []
        
        if tournament.type == 4:
            # 4人トーナメントの場合
            created_matches.extend(cls._create_4_player_next_round(tournament))
        elif tournament.type == 8:
            # 8人トーナメントの場合
            created_matches.extend(cls._create_8_player_next_round(tournament))
        
        return created_matches

    @classmethod
    def _create_4_player_next_round(cls, tournament):
        """4人トーナメントの次のラウンドマッチを作成"""
        created_matches = []
        # ラウンド2のプレイヤーを取得（ラウンド1の勝者）
        round2_players = TournamentPlayer.objects.filter(
            tournament=tournament,
            round=2
        ).order_by('entry_number')
        
        # 2人揃ったら決勝戦を作成
        if round2_players.count() == 2:
            # 既に決勝戦が作成されているかチェック
            existing_matches = Match.objects.filter(
                tournament=tournament
            ).count()
            
            # 既に3試合ある場合は決勝戦作成済み
            if existing_matches < 3:
                player1 = round2_players[0]
                player2 = round2_players[1]
                
                match = cls.create_for_tournament(tournament)
                created_matches.append(match)
                
                MatchDetail.create(match, player1.user)
                MatchDetail.create(match, player2.user)
        
        return created_matches

    @classmethod
    def _create_8_player_next_round(cls, tournament):
        """8人トーナメントの次のラウンドマッチを作成"""
        created_matches = []
        
        # ラウンド2のプレイヤー（ラウンド1の勝者）
        round2_players = TournamentPlayer.objects.filter(
            tournament=tournament,
            round=2
        ).order_by('entry_number')
        
        # ラウンド3のプレイヤー（ラウンド2の勝者）
        round3_players = TournamentPlayer.objects.filter(
            tournament=tournament,
            round=3
        ).order_by('entry_number')
        
        # 準決勝（ラウンド2）のマッチ作成
        created_matches.extend(cls._create_semifinal_matches(tournament, round2_players))
        
        # 決勝（ラウンド3）のマッチ作成
        if round3_players.count() == 2:
            # 既に決勝戦が作成されているかチェック
            total_matches = Match.objects.filter(tournament=tournament).count()
            expected_matches_before_final = 4 + 2  # ラウンド1: 4試合 + 準決勝: 2試合
            
            if total_matches == expected_matches_before_final:
                player1 = round3_players[0]
                player2 = round3_players[1]
                
                match = cls.create_for_tournament(tournament)
                created_matches.append(match)
                
                MatchDetail.create(match, player1.user)
                MatchDetail.create(match, player2.user)
        
        return created_matches

    @classmethod
    def _create_semifinal_matches(cls, tournament, round2_players):
        """準決勝マッチを作成（ブロック単位で勝者が出揃った時点で作成）"""
        created_matches = []
        
        # ブロック1（0,1 vs 2,3）のマッチ作成チェック
        block1_winners = round2_players.filter(entry_number__lt=4)
        if block1_winners.count() == 2 and not cls._block_semifinal_exists(tournament, block_range=(0, 3)):
            # ブロック1で2人の勝者が出た場合、マッチ作成
            block1_list = list(block1_winners[:2])
            player1 = block1_list[0]
            player2 = block1_list[1]
            
            match = cls.create_for_tournament(tournament)
            created_matches.append(match)
            
            MatchDetail.create(match, player1.user)
            MatchDetail.create(match, player2.user)
        
        # ブロック2（4,5 vs 6,7）のマッチ作成チェック
        block2_winners = round2_players.filter(entry_number__gte=4)
        if block2_winners.count() == 2 and not cls._block_semifinal_exists(tournament, block_range=(4, 7)):
            # ブロック2で2人の勝者が出た場合、マッチ作成
            block2_list = list(block2_winners[:2])
            player1 = block2_list[0]
            player2 = block2_list[1]
            
            match = cls.create_for_tournament(tournament)
            created_matches.append(match)
            
            MatchDetail.create(match, player1.user)
            MatchDetail.create(match, player2.user)
        
        return created_matches

    @classmethod
    def _block_semifinal_exists(cls, tournament, block_range):
        """指定されたブロック範囲の準決勝マッチが既に存在するかチェック"""
        min_entry, max_entry = block_range
        
        # そのトーナメントの全マッチを取得
        matches = Match.objects.filter(tournament=tournament)
        
        for match in matches:
            # マッチの参加者のエントリー番号を取得
            match_details = MatchDetail.objects.filter(match=match)
            participants_entry_numbers = []
            
            for detail in match_details:
                try:
                    tournament_player = TournamentPlayer.objects.get(
                        tournament=tournament,
                        user=detail.user,
                        round__gte=2  # ラウンド2以上（準決勝参加者）
                    )
                    participants_entry_numbers.append(tournament_player.entry_number)
                except TournamentPlayer.DoesNotExist:
                    continue
            
            # 指定されたブロック範囲の2人が参加しているマッチかチェック
            if (len(participants_entry_numbers) == 2 and 
                all(min_entry <= entry <= max_entry for entry in participants_entry_numbers)):
                return True
        
        return False

class MatchDetail(models.Model):
    match = models.ForeignKey(Match, on_delete = models.CASCADE)
    user = models.ForeignKey(User, on_delete = models.CASCADE)
    score = models.IntegerField(default = 0)
    is_left_side = models.BooleanField(default = True)

    class Meta:
        db_table = 'match_details'

    @classmethod
    def create(cls, match, user, is_left_side):
        if match.is_finished:
            raise ValueError("Cannot create a match detail for a finished match.")
        return cls.objects.create(
            match = match,
            user = user,
            is_left_side = is_left_side
        )
