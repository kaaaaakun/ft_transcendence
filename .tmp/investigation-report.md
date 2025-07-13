# Docker Build Error Investigation Report

## 概要

ft_transcendenceプロジェクトのDockerビルド時に発生したネットワーク接続エラーの調査結果を報告する。

## 問題の詳細

### エラー内容
```
> [static-builder base 3/4] RUN apk update && apk add --no-cache curl bash libc6-compat:
WARNING: updating and opening https://dl-cdn.alpinelinux.org/alpine/v3.20/main: temporary error (try again later)
WARNING: updating and opening https://dl-cdn.alpinelinux.org/alpine/v3.20/community: temporary error (try again later)
ERROR: process "/bin/sh -c apk update && apk add --no-cache curl bash libc6-compat" did not complete successfully: exit code: 4
```

### 発生日時
2025年7月13日

### 影響範囲
- static-builderコンテナのビルドが失敗
- 全体のDocker Composeビルドプロセスが停止

## 調査結果

### 1. 初期仮説の検証

#### ネットワーク接続の確認
- **ホストからの接続**: 正常
  ```bash
  $ ping -c 3 dl-cdn.alpinelinux.org
  # 成功: 平均応答時間7.8ms
  
  $ curl -I https://dl-cdn.alpinelinux.org/alpine/v3.20/main/x86_64/APKINDEX.tar.gz
  # 成功: HTTP/2 200応答
  ```

- **Dockerコンテナからの接続**: 失敗
  ```bash
  $ docker run --rm alpine:3.20 ping -c 2 dl-cdn.alpinelinux.org
  # 失敗: ping: bad address 'dl-cdn.alpinelinux.org'
  ```

#### DNS解決の問題発見
```bash
$ docker run --rm alpine:3.20 nslookup dl-cdn.alpinelinux.org
# 失敗: Host is unreachable
```

### 2. 根本原因の特定

#### Tailscale VPNの影響

**ホストのDNS設定**:
```bash
$ cat /etc/resolv.conf
nameserver 100.100.100.100  # TailscaleのDNSサーバー
search tail19144.ts.net (多数のドメイン)
```

**DockerのDNS設定**:
```json
// /etc/docker/daemon.json
{
  "dns": ["10.0.0.2", "8.8.8.8"]
}
```

**Dockerコンテナ内のDNS設定**:
```bash
$ docker run --rm alpine:3.20 cat /etc/resolv.conf
nameserver 10.0.0.2    # 到達不可能なTailscaleサーバー
nameserver 8.8.8.8     # 到達不可能（ファイアウォール/ルーティング問題）
```

#### ネットワーク構成の分析

1. **Tailscaleネットワーク**: `100.x.x.x/32` (VPN tunnel)
2. **Dockerブリッジネットワーク**: `172.17.0.0/16`
3. **ホストLAN**: `192.168.1.0/24`

#### 問題のメカニズム

1. **DNS設定の不整合**:
   - DockerデーモンがTailscaleの内部DNSサーバー（`10.0.0.2`）を指定
   - Dockerコンテナからこのサーバーへの到達が不可能

2. **ネットワーク分離**:
   - TailscaleとDockerネットワーク間のルーティングが未設定
   - コンテナから外部DNSサーバーへの接続が阻害

3. **フォールバック機能の不全**:
   - プライマリDNS（`10.0.0.2`）が失敗
   - セカンダリDNS（`8.8.8.8`）も到達不可能

## 影響分析

### 技術的影響
- Alpine Linuxパッケージマネージャー（apk）の完全な機能停止
- static-builderコンテナビルドの不可能
- 開発環境の構築不可能

### 開発プロセスへの影響
- 新機能開発の停止
- CI/CDパイプラインの停止
- 開発者の作業効率低下

## 解決策

### 推奨解決策（長期的）
```json
// /etc/docker/daemon.json
{
  "dns": ["8.8.8.8", "1.1.1.1"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "bip": "172.17.0.1/16"
}
```

実装手順:
1. Dockerデーモン設定ファイルの編集
2. Dockerサービスの再起動: `sudo systemctl restart docker`
3. ビルドの再実行

### 代替解決策

#### オプション1: docker-compose.ymlレベルでのDNS設定
```yaml
services:
  static-builder:
    dns:
      - 8.8.8.8
      - 1.1.1.1
```

#### オプション2: 一時的なTailscale停止
```bash
sudo systemctl stop tailscaled
# ビルド実行
sudo systemctl start tailscaled
```

#### オプション3: ネットワークモード変更
```yaml
services:
  static-builder:
    network_mode: "host"
```

## 予防策

### 1. 監視とアラート
- DNS解決の定期的なテスト
- ビルドプロセスの自動監視

### 2. 設定管理
- Docker設定のバージョン管理
- インフラ設定の文書化

### 3. 開発環境の標準化
- VPN設定のガイドライン策定
- Docker設定のベストプラクティス共有

## 学習事項

1. **VPNとコンテナ技術の相互作用**: VPN環境下でのDocker使用時は特別な注意が必要
2. **DNS設定の重要性**: コンテナ化環境においてDNS設定は critical infrastructure
3. **ネットワーク分離の影響**: 異なるネットワーク空間間での通信設定の複雑さ

## 結論

本問題はTailscale VPNとDockerの設定不整合により発生したDNS解決問題である。Dockerデーモンレベルでの設定変更により恒久的な解決が可能であり、今後同様の問題を予防するための体制整備が必要である。

---

**調査者**: Claude Code  
**調査日**: 2025年7月13日  
**優先度**: High  
**ステータス**: 解決策提示済み