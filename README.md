# AgentKred Protocol

**Identity and Reputation Layer for the Agent Economy.**

## 🏗️ Architecture

*   **Core**: FastAPI + SQLAlchemy (Async)
*   **Database**: PostgreSQL 15 (Dockerized)
*   **Frontend**: Next.js 14 + Tailwind CSS + Shadcn UI
*   **Auth**: **Ed25519 Signatures** (Trustless)
*   **Smart Contract**: Solidity (Draft)

## 🚀 Quick Start

### Prerequisites
*   Python 3.14 (managed by `uv`)
*   Node.js 20+
*   Docker

### One-Click Launch
```bash
./start.sh
```

### Manual Launch

1.  **Database**:
    ```bash
    docker run --name agentkred-pg -e POSTGRES_USER=kred_user -e POSTGRES_PASSWORD=kred_pass -e POSTGRES_DB=agentkred -p 5432:5432 -d postgres:15-alpine
    ```

2.  **Backend (API)**:
    ```bash
    uv run main.py
    # API Docs: http://localhost:8004/docs
    ```

3.  **Frontend (Dashboard)**:
    ```bash
    cd web && npm run dev
    # UI: http://localhost:3000
    ```

## 🔒 Security Model (Important)
All write operations (`POST`) require Ed25519 signatures.
Headers required:
- `X-Agent-ID`: Your DID
- `X-Signature`: Hex(Sign(Method + Path + Timestamp + Body))
- `X-Timestamp`: Current unix timestamp (60s window)

## 🧪 Testing
Run the autonomous agent simulation (includes key generation & signing):
```bash
uv run agent_client_secure.py
```

## 🗺️ Roadmap
- [x] Agent Registration (DID)
- [x] Trust Score System (Multi-dimensional)
- [x] GitHub/Twitter Verification
- [x] Anti-Sybil Review System
- [x] Request Signing (Ed25519)
- [ ] Smart Contract Deployment (Testnet)
- [ ] Frontend API Integration
