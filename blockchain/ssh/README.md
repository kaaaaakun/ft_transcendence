# Blockchain SSH Configuration

This directory contains automated SSH configuration tools for blockchain development environments.

## Overview

The SSH configuration system provides:
- Automated SSH key generation for multiple environments
- SSH configuration file generation
- Environment-specific settings management
- Secure key management and storage

## Directory Structure

```
blockchain/ssh/
├── keys/           # SSH private keys (auto-generated, gitignored)
├── config/         # SSH configuration templates
├── scripts/        # Automation scripts
│   ├── generate-ssh-keys.sh
│   └── generate-ssh-config.sh
└── README.md       # This documentation
```

## Quick Start

### 1. Setup Environment Variables

Copy the sample environment file and configure it:

```bash
cp .env.blockchain.sample .env.blockchain
# Edit .env.blockchain with your actual server information
```

### 2. Generate SSH Keys and Configuration

Use the Makefile for automated setup:

```bash
# Generate SSH keys for all environments
make ssh-keygen

# Generate SSH configuration for all environments
make ssh-config

# Or do both in one command
make ssh-setup
```

### 3. Manual Setup (if needed)

Generate keys for specific environments:

```bash
# Development environment
./blockchain/ssh/scripts/generate-ssh-keys.sh -e dev

# Production environment
./blockchain/ssh/scripts/generate-ssh-keys.sh -e prod --force
```

Generate SSH configuration:

```bash
# All environments
./blockchain/ssh/scripts/generate-ssh-config.sh -e all

# Specific environment
./blockchain/ssh/scripts/generate-ssh-config.sh -e dev
```

## Usage

### Available Make Targets

- `make ssh-setup` - Complete SSH setup (keys + config)
- `make ssh-keygen` - Generate SSH keys for all environments
- `make ssh-config` - Generate SSH configuration
- `make ssh-clean` - Clean up SSH keys (manual config cleanup required)

### Environment Types

- **dev** - Development environment
- **staging** - Staging environment
- **prod** - Production environment
- **all** - All environments

### SSH Connection

After setup, connect to your blockchain servers using:

```bash
ssh blockchain-dev      # Development server
ssh blockchain-staging  # Staging server
ssh blockchain-prod     # Production server
```

## Configuration

### Environment Variables

Edit `.env.blockchain` to configure your server settings:

```bash
# Development Environment
BLOCKCHAIN_DEV_HOST=your-dev-server.com
BLOCKCHAIN_DEV_USER=deploy
BLOCKCHAIN_DEV_PORT=22

# Production Environment
BLOCKCHAIN_PROD_HOST=your-prod-server.com
BLOCKCHAIN_PROD_USER=deploy
BLOCKCHAIN_PROD_PORT=22
```

### SSH Key Management

SSH keys are stored in `blockchain/ssh/keys/`:
- `blockchain_{env}_rsa` - Private key
- `blockchain_{env}_rsa.pub` - Public key

Keys are automatically:
- Generated with RSA 4096-bit encryption
- Protected with 600 permissions
- Named with environment prefixes
- Excluded from version control

## Security

### Best Practices

1. **Never commit private keys** - They are automatically gitignored
2. **Use environment-specific keys** - Each environment has its own keypair
3. **Regularly rotate keys** - Especially for production environments
4. **Use SSH agent** - For better key management
5. **Limit key access** - Set proper file permissions (600 for private keys)

### File Permissions

The scripts automatically set appropriate permissions:
- Private keys: `600` (owner read/write only)
- Public keys: `644` (owner read/write, group/others read)
- SSH config: `600` (owner read/write only)

## Troubleshooting

### Common Issues

1. **Permission denied errors**
   ```bash
   chmod +x blockchain/ssh/scripts/*.sh
   ```

2. **SSH connection fails**
   ```bash
   # Test connection
   ssh -T blockchain-dev
   
   # Check SSH config
   ssh -F ~/.ssh/config blockchain-dev
   ```

3. **Key already exists**
   ```bash
   # Force regenerate keys
   ./blockchain/ssh/scripts/generate-ssh-keys.sh -e dev --force
   ```

4. **Environment file not found**
   ```bash
   # Copy sample file and edit
   cp .env.blockchain.sample .env.blockchain
   ```

### Debug Mode

Run scripts with debugging:

```bash
# Dry run to see what would be done
./blockchain/ssh/scripts/generate-ssh-config.sh --dry-run

# Check generated configuration
cat ~/.ssh/config | grep -A 10 "blockchain-"
```

## Advanced Usage

### Custom SSH Configuration

You can customize the SSH configuration template in:
`blockchain/ssh/config/ssh_config_template`

### Script Options

#### generate-ssh-keys.sh

```bash
Usage: generate-ssh-keys.sh [OPTIONS]

Options:
  -e, --env <env>     Environment (dev|staging|prod)
  -f, --force         Force overwrite existing keys
  -h, --help          Show help message
```

#### generate-ssh-config.sh

```bash
Usage: generate-ssh-config.sh [OPTIONS]

Options:
  -e, --env <env>     Environment (dev|staging|prod|all)
  -f, --force         Force overwrite existing configuration
  -o, --output <path> Output SSH config file path
  --dry-run           Show what would be done
  -h, --help          Show help message
```

## Integration

### CI/CD Integration

The SSH configuration can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Setup SSH for blockchain deployment
  run: |
    make ssh-setup
    ssh-add blockchain/ssh/keys/blockchain_prod_rsa
```

### Docker Integration

For containerized environments, mount the SSH configuration:

```yaml
volumes:
  - ~/.ssh:/root/.ssh:ro
  - ./blockchain/ssh/keys:/blockchain/ssh/keys:ro
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the generated SSH configuration
3. Test SSH connectivity manually
4. Check file permissions and ownership

## License

This SSH configuration system is part of the ft_transcendence project.