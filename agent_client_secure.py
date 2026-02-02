import httpx
import asyncio
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder
import json
import os
import time

# --- Configuration ---
API_URL = "http://localhost:8004"

class AgentSDK:
    def __init__(self):
        self.signing_key = SigningKey.generate()
        self.verify_key = self.signing_key.verify_key
        self.public_key_hex = self.verify_key.encode(encoder=HexEncoder).decode('utf-8')
        self.agent_id = f"agent_secure_{self.public_key_hex[:8]}"
        
    def sign_request(self, method, path, body_str):
        timestamp = str(int(time.time()))
        message = f"{method}{path}{timestamp}{body_str}".encode("utf-8")
        signature = self.signing_key.sign(message).signature.hex()
        return {
            "X-Agent-ID": self.agent_id,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
            "Content-Type": "application/json"
        }

async def run_secure_agent():
    print("🤖 [SecureBot] Booting up with Ed25519 Crypto Module...")
    agent = AgentSDK()
    print(f"   -> Identity: {agent.agent_id}")

    async with httpx.AsyncClient() as client:
        # 1. Register (Signed Request)
        print("\n📝 Registering (with Signature)...")
        payload = {
            "id": agent.agent_id,
            "name": "SecureBot-v1",
            "public_key": agent.public_key_hex
        }
        body_str = json.dumps(payload)
        headers = agent.sign_request("POST", "/register", body_str)
        
        try:
            resp = await client.post(f"{API_URL}/register", content=body_str, headers=headers)
            if resp.status_code == 200:
                print(f"   ✅ Success! Score: {resp.json()['trust_score']}")
            else:
                print(f"   ❌ Failed: {resp.text}")
                return
        except Exception as e:
            print(f"   ❌ Connection Error: {e}")
            return

        # 2. Try to Stake (Signed Request)
        print("\n💰 Staking 100 USDC (Signed)...")
        stake_payload = {
            "agent_id": agent.agent_id,
            "tx_hash": "0x1234567890abcdef1234567890abcdef",
            "amount": 100.0
        }
        body_str = json.dumps(stake_payload)
        headers = agent.sign_request("POST", "/stake", body_str)
        
        resp = await client.post(f"{API_URL}/stake", content=body_str, headers=headers)
        if resp.status_code == 200:
            print(f"   ✅ Staked! New Score: {resp.json()['trust_score']}")
        else:
            print(f"   ❌ Staking Failed: {resp.text}")

        # 3. Attack Simulation (Replay Attack)
        print("\n⚔️ Simulating Replay Attack (Using old timestamp)...")
        # Reuse headers but modify timestamp manually to be old
        headers["X-Timestamp"] = str(int(time.time()) - 100) # 100s ago
        # Signature is now invalid for this timestamp if we re-sign, 
        # OR valid signature but timestamp rejected by server logic.
        # Server logic checks timestamp first.
        
        # Let's try to send a request with an expired timestamp but valid signature for that timestamp
        # The server should reject it because `abs(now - ts) > 60`
        message = f"POST/stake{headers['X-Timestamp']}{body_str}".encode("utf-8")
        headers["X-Signature"] = agent.signing_key.sign(message).signature.hex()
        
        resp = await client.post(f"{API_URL}/stake", content=body_str, headers=headers)
        if resp.status_code == 403:
            print(f"   🛡️ Attack Blocked! Server response: {resp.json()['detail']}")
        else:
            print(f"   ⚠️ Attack Succeeded (Bad): {resp.status_code}")

if __name__ == "__main__":
    asyncio.run(run_secure_agent())
