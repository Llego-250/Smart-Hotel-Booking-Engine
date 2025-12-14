# Smart Hotel Booking Engine - Deployment Guide

## Overview

This guide covers the complete deployment process for the Smart Hotel Booking Engine, from development environment setup to production deployment and maintenance.

## System Requirements

### Minimum Hardware Requirements

#### Development Environment
- **CPU**: 4 cores, 2.5GHz
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB available space
- **Network**: Broadband internet connection

#### Production Environment
- **CPU**: 8 cores, 3.0GHz
- **RAM**: 32GB minimum, 64GB recommended
- **Storage**: 500GB SSD (database), 100GB SSD (application)
- **Network**: High-speed dedicated connection

### Software Requirements

#### Database Server
- **Oracle Database**: 19c or higher (Enterprise/Standard Edition)
- **Operating System**: 
  - Windows Server 2019/2022
  - Oracle Linux 8/9
  - Red Hat Enterprise Linux 8/9
- **Java**: JDK 11 or higher (for Oracle tools)

#### Application Server
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **Operating System**: 
  - Windows Server 2019/2022
  - Linux (Ubuntu 20.04+, CentOS 8+)

#### Web Server (Production)
- **Nginx**: Version 1.20+ or **Apache HTTP Server**: Version 2.4+
- **SSL Certificate**: Valid SSL certificate for HTTPS

## Environment Setup

### Development Environment

#### 1. Database Setup

```sql
-- Create database user
CREATE USER pdb_admin IDENTIFIED BY "12345";

-- Grant necessary privileges
GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE TO pdb_admin;
GRANT UNLIMITED TABLESPACE TO pdb_admin;

-- Connect as pdb_admin user
CONNECT pdb_admin/12345@localhost:1521/SHBE_db;

-- Run database scripts
@database/scripts/01_functions_procedures.sql
@database/scripts/02_triggers.sql
@database/scripts/03_insert_data.sql
```

#### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Create environment file
cat > .env << EOF
NODE_ENV=development
PORT=3001
DB_USER=pdb_admin
DB_PASSWORD=12345
DB_CONNECT_STRING=localhost:1521/SHBE_db
EOF

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 3. Frontend Setup

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Verification

```bash
# Test database connection
cd server
node -e "
const oracledb = require('oracledb');
const config = {
  user: 'pdb_admin',
  password: '12345',
  connectString: 'localhost:1521/SHBE_db'
};
oracledb.getConnection(config)
  .then(conn => { console.log('Database connected!'); conn.close(); })
  .catch(err => console.error('Database error:', err));
"

# Test API endpoints
curl http://localhost:3001/api/dashboard/metrics

# Test frontend
curl http://localhost:5173
```

### Staging Environment

#### 1. Database Configuration

```sql
-- Create staging user
CREATE USER hotel_staging IDENTIFIED BY "staging_password_456";

-- Grant privileges
GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE TO hotel_staging;
GRANT UNLIMITED TABLESPACE TO hotel_staging;

-- Create tablespace for staging
CREATE TABLESPACE hotel_staging_data
DATAFILE '/opt/oracle/oradata/staging/hotel_staging.dbf' SIZE 1G
AUTOEXTEND ON NEXT 100M MAXSIZE 10G;

ALTER USER hotel_staging DEFAULT TABLESPACE hotel_staging_data;
```

#### 2. Application Configuration

```bash
# Server environment
cat > server/.env << EOF
NODE_ENV=staging
PORT=3001
DB_USER=hotel_staging
DB_PASSWORD=staging_password_456
DB_CONNECT_STRING=staging-db-server:1521/HOTEL
CORS_ORIGIN=https://staging.hotel-booking.com
EOF

# Build frontend for staging
npm run build

# Configure Nginx
sudo tee /etc/nginx/sites-available/hotel-staging << EOF
server {
    listen 80;
    server_name staging.hotel-booking.com;
    
    location / {
        root /var/www/hotel-staging/dist;
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/hotel-staging /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Production Deployment

### 1. Database Production Setup

#### Create Production Database

```sql
-- Connect as SYSDBA
CONNECT sys/password@prod-server:1521/HOTELPROD AS SYSDBA;

-- Create production user
CREATE USER hotel_prod IDENTIFIED BY "prod_secure_password_789";

-- Create dedicated tablespace
CREATE TABLESPACE hotel_prod_data
DATAFILE '/opt/oracle/oradata/prod/hotel_prod_data01.dbf' SIZE 5G
AUTOEXTEND ON NEXT 500M MAXSIZE 50G;

CREATE TABLESPACE hotel_prod_index
DATAFILE '/opt/oracle/oradata/prod/hotel_prod_index01.dbf' SIZE 2G
AUTOEXTEND ON NEXT 200M MAXSIZE 20G;

-- Assign tablespaces
ALTER USER hotel_prod DEFAULT TABLESPACE hotel_prod_data;
ALTER USER hotel_prod QUOTA UNLIMITED ON hotel_prod_data;
ALTER USER hotel_prod QUOTA UNLIMITED ON hotel_prod_index;

-- Grant production privileges
GRANT CONNECT, RESOURCE, CREATE VIEW, CREATE PROCEDURE TO hotel_prod;
GRANT SELECT_CATALOG_ROLE TO hotel_prod;
```

#### Deploy Database Objects

```bash
# Connect to production database
sqlplus hotel_prod/prod_secure_password_789@prod-server:1521/HOTELPROD

# Deploy in order
@database/scripts/01_functions_procedures.sql
@database/scripts/02_triggers.sql

# Load initial data (if needed)
@database/scripts/03_insert_data.sql

# Run comprehensive tests
@database/scripts/06_comprehensive_test.sql
```

### 2. Application Server Setup

#### Install Node.js (Production Server)

```bash
# Install Node.js via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 for process management
sudo npm install -g pm2
```

#### Deploy Backend Application

```bash
# Create application directory
sudo mkdir -p /opt/hotel-booking
sudo chown $USER:$USER /opt/hotel-booking

# Copy application files
cd /opt/hotel-booking
git clone https://github.com/your-repo/smart-hotel-booking-engine.git .

# Install production dependencies
cd server
npm ci --only=production

# Create production environment file
cat > .env << EOF
NODE_ENV=production
PORT=3001
DB_USER=hotel_prod
DB_PASSWORD=prod_secure_password_789
DB_CONNECT_STRING=prod-db-server:1521/HOTELPROD
CORS_ORIGIN=https://hotel-booking.com
LOG_LEVEL=info
EOF

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'hotel-booking-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/hotel-booking/api-error.log',
    out_file: '/var/log/hotel-booking/api-out.log',
    log_file: '/var/log/hotel-booking/api-combined.log',
    time: true
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/hotel-booking
sudo chown $USER:$USER /var/log/hotel-booking

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Deploy Frontend Application

```bash
# Build frontend for production
cd /opt/hotel-booking
npm ci
npm run build

# Copy build files to web server directory
sudo mkdir -p /var/www/hotel-booking
sudo cp -r dist/* /var/www/hotel-booking/
sudo chown -R www-data:www-data /var/www/hotel-booking
```

### 3. Web Server Configuration

#### Nginx Configuration

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/hotel-booking << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

server {
    listen 80;
    server_name hotel-booking.com www.hotel-booking.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hotel-booking.com www.hotel-booking.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/hotel-booking.crt;
    ssl_certificate_key /etc/ssl/private/hotel-booking.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend
    location / {
        root /var/www/hotel-booking;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Login endpoint rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:3001;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/hotel-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### 4. SSL Certificate Setup

#### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d hotel-booking.com -d www.hotel-booking.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 5. Database Backup Configuration

#### Automated Backup Script

```bash
# Create backup script
sudo tee /opt/scripts/backup-hotel-db.sh << 'EOF'
#!/bin/bash

# Configuration
ORACLE_HOME=/opt/oracle/product/19c/dbhome_1
ORACLE_SID=HOTELPROD
BACKUP_DIR=/opt/backups/hotel-db
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Export database
$ORACLE_HOME/bin/expdp hotel_prod/prod_secure_password_789@localhost:1521/HOTELPROD \
  SCHEMAS=hotel_prod \
  DIRECTORY=BACKUP_DIR \
  DUMPFILE=hotel_backup_$DATE.dmp \
  LOGFILE=hotel_backup_$DATE.log \
  COMPRESSION=ALL

# Compress backup
gzip $BACKUP_DIR/hotel_backup_$DATE.dmp

# Remove old backups
find $BACKUP_DIR -name "hotel_backup_*.dmp.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "hotel_backup_*.log" -mtime +$RETENTION_DAYS -delete

# Log completion
echo "$(date): Backup completed - hotel_backup_$DATE.dmp.gz" >> /var/log/hotel-backup.log
EOF

# Make script executable
sudo chmod +x /opt/scripts/backup-hotel-db.sh

# Create Oracle directory for backups
sqlplus hotel_prod/prod_secure_password_789@prod-server:1521/HOTELPROD << EOF
CREATE OR REPLACE DIRECTORY BACKUP_DIR AS '/opt/backups/hotel-db';
EXIT;
EOF

# Schedule daily backups
echo "0 2 * * * /opt/scripts/backup-hotel-db.sh" | sudo crontab -
```

## Monitoring and Logging

### 1. Application Monitoring

#### PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Monitor application
pm2 monit
```

#### Health Check Endpoint

```javascript
// Add to server.js
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute('SELECT 1 FROM DUAL');
    await connection.close();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});
```

### 2. Database Monitoring

#### Oracle Enterprise Manager (Optional)

```sql
-- Enable database monitoring
ALTER SYSTEM SET STATISTICS_LEVEL = TYPICAL;
ALTER SYSTEM SET TIMED_STATISTICS = TRUE;

-- Create monitoring user
CREATE USER hotel_monitor IDENTIFIED BY "monitor_password";
GRANT SELECT_CATALOG_ROLE TO hotel_monitor;
GRANT SELECT ANY DICTIONARY TO hotel_monitor;
```

#### Custom Monitoring Queries

```sql
-- Monitor active sessions
SELECT 
    username,
    status,
    COUNT(*) as session_count
FROM v$session 
WHERE username = 'HOTEL_PROD'
GROUP BY username, status;

-- Monitor tablespace usage
SELECT 
    tablespace_name,
    ROUND((used_space/total_space)*100, 2) as usage_percent
FROM (
    SELECT 
        tablespace_name,
        SUM(bytes) as total_space
    FROM dba_data_files
    GROUP BY tablespace_name
) total,
(
    SELECT 
        tablespace_name,
        SUM(bytes) as used_space
    FROM dba_segments
    GROUP BY tablespace_name
) used
WHERE total.tablespace_name = used.tablespace_name;
```

### 3. Log Management

#### Centralized Logging with rsyslog

```bash
# Configure rsyslog for application logs
sudo tee /etc/rsyslog.d/50-hotel-booking.conf << EOF
# Hotel Booking Application Logs
local0.*    /var/log/hotel-booking/application.log
local1.*    /var/log/hotel-booking/database.log
local2.*    /var/log/hotel-booking/security.log

# Rotate logs
\$WorkDirectory /var/spool/rsyslog
\$ActionFileDefaultTemplate RSYSLOG_TraditionalFileFormat
EOF

sudo systemctl restart rsyslog
```

## Security Configuration

### 1. Firewall Setup

```bash
# Configure UFW firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (change port if needed)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Oracle database (internal network only)
sudo ufw allow from 10.0.0.0/8 to any port 1521

# Check status
sudo ufw status verbose
```

### 2. Database Security

```sql
-- Enable audit trail
ALTER SYSTEM SET AUDIT_TRAIL = DB SCOPE = SPFILE;

-- Audit critical operations
AUDIT INSERT, UPDATE, DELETE ON hotel_prod.RESERVATION;
AUDIT INSERT, UPDATE, DELETE ON hotel_prod.PAYMENT;
AUDIT CREATE USER, DROP USER, ALTER USER;

-- Password policy
ALTER PROFILE DEFAULT LIMIT
    PASSWORD_LIFE_TIME 90
    PASSWORD_GRACE_TIME 7
    PASSWORD_REUSE_TIME 365
    PASSWORD_REUSE_MAX 5
    FAILED_LOGIN_ATTEMPTS 5
    PASSWORD_LOCK_TIME 1;
```

### 3. Application Security

#### Environment Variables Security

```bash
# Secure environment file permissions
chmod 600 server/.env
chown hotel-app:hotel-app server/.env

# Use systemd environment file
sudo tee /etc/systemd/system/hotel-booking.service << EOF
[Unit]
Description=Hotel Booking API
After=network.target

[Service]
Type=simple
User=hotel-app
WorkingDirectory=/opt/hotel-booking/server
EnvironmentFile=/opt/hotel-booking/server/.env
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

## Performance Optimization

### 1. Database Performance

```sql
-- Gather statistics
BEGIN
    DBMS_STATS.GATHER_SCHEMA_STATS(
        ownname => 'HOTEL_PROD',
        estimate_percent => DBMS_STATS.AUTO_SAMPLE_SIZE,
        method_opt => 'FOR ALL COLUMNS SIZE AUTO',
        cascade => TRUE
    );
END;
/

-- Monitor performance
SELECT sql_text, executions, elapsed_time/1000000 as elapsed_seconds
FROM v$sql
WHERE parsing_schema_name = 'HOTEL_PROD'
ORDER BY elapsed_time DESC
FETCH FIRST 10 ROWS ONLY;
```

### 2. Application Performance

#### Node.js Optimization

```javascript
// server.js optimizations
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    // Your application code
    require('./app.js');
}
```

#### Nginx Caching

```nginx
# Add to Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    gzip_static on;
}

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Disaster Recovery

### 1. Database Recovery Plan

#### Full Recovery Procedure

```bash
# Stop application
pm2 stop all

# Restore database from backup
impdp hotel_prod/prod_secure_password_789@prod-server:1521/HOTELPROD \
  SCHEMAS=hotel_prod \
  DIRECTORY=BACKUP_DIR \
  DUMPFILE=hotel_backup_20241024_020000.dmp \
  REMAP_SCHEMA=hotel_prod:hotel_prod \
  TABLE_EXISTS_ACTION=REPLACE

# Restart application
pm2 start all
```

### 2. Application Recovery

#### Blue-Green Deployment

```bash
# Prepare green environment
sudo mkdir -p /opt/hotel-booking-green
sudo cp -r /opt/hotel-booking/* /opt/hotel-booking-green/

# Update green environment
cd /opt/hotel-booking-green
git pull origin main
npm ci --only=production

# Test green environment
PORT=3002 npm start &

# Switch traffic (update Nginx)
sudo sed -i 's/localhost:3001/localhost:3002/g' /etc/nginx/sites-available/hotel-booking
sudo nginx -t && sudo systemctl reload nginx

# Stop old version
pm2 stop hotel-booking-api
```

## Maintenance Procedures

### 1. Regular Maintenance Tasks

#### Weekly Tasks

```bash
#!/bin/bash
# weekly-maintenance.sh

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up logs
find /var/log/hotel-booking -name "*.log" -mtime +7 -delete

# Restart services
sudo systemctl restart nginx
pm2 restart all

# Check disk space
df -h | grep -E "(/$|/opt|/var)"

# Database maintenance
sqlplus hotel_prod/password@server << EOF
EXEC DBMS_STATS.GATHER_SCHEMA_STATS('HOTEL_PROD');
EXIT;
EOF
```

#### Monthly Tasks

```bash
#!/bin/bash
# monthly-maintenance.sh

# Security updates
sudo apt update && sudo apt upgrade -y

# Certificate renewal check
sudo certbot renew --dry-run

# Database cleanup
sqlplus hotel_prod/password@server << EOF
-- Archive old audit logs
DELETE FROM audit_log WHERE operation_date < SYSDATE - 90;
COMMIT;
EXIT;
EOF

# Performance analysis
pm2 logs --lines 1000 | grep -i error > /tmp/monthly-errors.log
```

### 2. Scaling Procedures

#### Horizontal Scaling

```bash
# Add new application server
# 1. Set up new server with same configuration
# 2. Update load balancer configuration

# Nginx upstream configuration
upstream hotel_api {
    server 10.0.1.10:3001;
    server 10.0.1.11:3001;
    server 10.0.1.12:3001;
}

server {
    location /api {
        proxy_pass http://hotel_api;
    }
}
```

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

```bash
# Check Oracle listener
lsnrctl status

# Test connection
sqlplus hotel_prod/password@server:1521/HOTELPROD

# Check network connectivity
telnet db-server 1521
```

#### Application Performance Issues

```bash
# Check PM2 processes
pm2 list
pm2 logs

# Monitor system resources
htop
iostat -x 1

# Check database performance
sqlplus hotel_prod/password@server << EOF
SELECT * FROM v\$session_longops WHERE time_remaining > 0;
EXIT;
EOF
```

#### SSL Certificate Issues

```bash
# Check certificate expiration
openssl x509 -in /etc/ssl/certs/hotel-booking.crt -text -noout | grep "Not After"

# Test SSL configuration
openssl s_client -connect hotel-booking.com:443 -servername hotel-booking.com

# Renew certificate
sudo certbot renew --force-renewal
```

---

*This deployment guide provides comprehensive instructions for deploying and maintaining the Smart Hotel Booking Engine in production environments.*