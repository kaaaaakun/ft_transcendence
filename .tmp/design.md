# ELK Kibana Reverse Proxy Configuration Design

## Overview

KibanaをNGINXリバースプロキシ経由でアクセスできるよう設定し、セキュリティ向上のためKibanaの直接外部公開を停止する。

## Requirements

### Functional Requirements
- Kibanaダッシュボードへの`/kibana/`パス経由でのアクセス
- ELKスタック（Elasticsearch, Logstash, Kibana）の統合運用
- Metricbeatによるシステム監視機能
- SSL/TLS暗号化通信

### Non-Functional Requirements
- セキュリティ: 直接ポートアクセスの無効化
- 可用性: プロキシ経由での安定したアクセス
- 監視性: Metricbeatによる各サービス監視
- 保守性: 統一されたプロキシ設定

## Architecture

### Network Configuration
```
Client -> NGINX (443/SSL) -> /kibana/ -> Kibana Container (5601)
                          -> /api/    -> API Container (8000)
                          -> /        -> Frontend (Static Files)
```

### Service Dependencies
- Kibana: depends on Elasticsearch
- Metricbeat: monitors Kibana, Elasticsearch, Logstash
- Setup: initializes Elasticsearch/Kibana configurations

## Configuration Details

### Kibana Configuration
- `server.basePath: /kibana`
- `server.rewriteBasePath: true`
- Internal network access only (expose instead of ports)

### NGINX Proxy Configuration
- SSL termination at proxy level
- Security headers for all proxied services
- Timeout configurations for reliability

### Metricbeat Monitoring
- Elasticsearch: `http://elasticsearch:9200`
- Logstash: `http://logstash:9600`
- Kibana: `http://kibana:5601/kibana` (basePath aware)

## Security Considerations

### Access Control
- No direct external access to ELK ports
- SSL/TLS encryption for all external communications
- Proper proxy headers for client identification

### Network Isolation
- Internal Docker network (`net_pong`) for service communication
- Only NGINX exposed to external network
- Volume-based persistent data storage

## Testing Strategy

### Functional Testing
- Kibana dashboard accessibility via `/kibana/`
- API functionality via `/api/`
- Static file serving via `/`
- SSL certificate validation

### Security Testing
- Direct port access verification (should be blocked)
- SSL/TLS configuration verification
- Proxy header validation

### Monitoring Testing
- Metricbeat data collection verification
- Elasticsearch index creation
- Kibana visualization functionality

## Deployment Process

1. Network and volume creation
2. SSL certificate generation
3. ELK stack initialization
4. Setup container execution
5. Service health verification

## Maintenance

### Log Management
- NGINX access/error logs
- ELK service logs
- Metricbeat monitoring data

### Updates
- Rolling updates for ELK components
- SSL certificate renewal
- Configuration updates through volume mounts