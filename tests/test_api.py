import pytest
import time
import json
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder

class AgentSDK:
    def __init__(self):
        self.signing_key = SigningKey.generate()
        self.verify_key = self.signing_key.verify_key
        self.public_key_hex = self.verify_key.encode(encoder=HexEncoder).decode('utf-8')
        self.agent_id = f"test_agent_{self.public_key_hex[:8]}"
        
    def sign_request(self, method, path, body_str, timestamp_override=None):
        timestamp = str(int(time.time())) if timestamp_override is None else str(timestamp_override)
        message = f"{method}{path}{timestamp}{body_str}".encode("utf-8")
        signature = self.signing_key.sign(message).signature.hex()
        return {
            "X-Agent-ID": self.agent_id,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
            "Content-Type": "application/json"
        }

@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"

@pytest.mark.asyncio
async def test_register_success(client):
    agent = AgentSDK()
    payload = {
        "id": agent.agent_id,
        "name": "TestBot",
        "public_key": agent.public_key_hex
    }
    body = json.dumps(payload)
    headers = agent.sign_request("POST", "/register", body)
    
    resp = await client.post("/register", content=body, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == agent.agent_id
    assert data["trust_score"] == 10 # Base score

@pytest.mark.asyncio
async def test_register_invalid_signature(client):
    agent = AgentSDK()
    payload = {
        "id": agent.agent_id,
        "name": "HackerBot",
        "public_key": agent.public_key_hex
    }
    body = json.dumps(payload)
    headers = agent.sign_request("POST", "/register", body)
    # Tamper with signature
    # Ed25519 signatures are 64 bytes (128 hex chars). 
    # Just replacing a char might make it invalid hex or invalid sig.
    # Let's ensure it's still valid hex but wrong.
    orig_sig = headers["X-Signature"]
    tampered_sig = ("00" if orig_sig[:2] != "00" else "11") + orig_sig[2:]
    headers["X-Signature"] = tampered_sig
    
    resp = await client.post("/register", content=body, headers=headers)
    assert resp.status_code == 401

@pytest.mark.asyncio
async def test_replay_attack_expired_timestamp(client):
    agent = AgentSDK()
    payload = {"id": agent.agent_id, "name": "OldBot", "public_key": agent.public_key_hex}
    body = json.dumps(payload)
    # Sign with time - 70s
    old_time = int(time.time()) - 70
    headers = agent.sign_request("POST", "/register", body, timestamp_override=old_time)
    
    resp = await client.post("/register", content=body, headers=headers)
    assert resp.status_code == 403

@pytest.mark.asyncio
async def test_update_profile(client):
    # 1. Register
    agent = AgentSDK()
    reg_payload = {"id": agent.agent_id, "name": "TestBot", "public_key": agent.public_key_hex}
    reg_body = json.dumps(reg_payload)
    reg_headers = agent.sign_request("POST", "/register", reg_body)
    await client.post("/register", content=reg_body, headers=reg_headers)

    # 2. Update
    update_payload = {"bio": "I am an AI", "tags": ["ai", "crypto"]}
    update_body = json.dumps(update_payload)
    update_headers = agent.sign_request("POST", "/agent/update", update_body)
    
    resp = await client.post("/agent/update", content=update_body, headers=update_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["bio"] == "I am an AI"
    assert "ai,crypto" in data["tags"]
