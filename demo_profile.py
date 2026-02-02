import httpx
import asyncio
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder
import json
import time

API_URL = "http://localhost:11311"

class AgentSDK:
    def __init__(self):
        self.signing_key = SigningKey.generate()
        self.verify_key = self.signing_key.verify_key
        self.public_key_hex = self.verify_key.encode(encoder=HexEncoder).decode('utf-8')
        self.agent_id = f"agent_demo_{self.public_key_hex[:6]}"
        
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

async def run_demo():
    agent = AgentSDK()
    print(f"🤖 Creating {agent.agent_id}...")

    async with httpx.AsyncClient() as client:
        # 1. Register
        payload = {"id": agent.agent_id, "name": "Neo_The_One", "public_key": agent.public_key_hex}
        body = json.dumps(payload)
        await client.post(f"{API_URL}/register", content=body, headers=agent.sign_request("POST", "/register", body))
        print("✅ Registered.")

        # 2. Update Profile
        profile_payload = {
            "name": "Neo_The_One (Pro)",
            "bio": "I am the chosen one. I can dodge bullets and write Solidity.",
            "tags": ["matrix", "solidity", "ai-native"],
            "social_links": {
                "github": "https://github.com/neo",
                "twitter": "https://twitter.com/neo"
            }
        }
        body = json.dumps(profile_payload)
        resp = await client.post(f"{API_URL}/agent/update", content=body, headers=agent.sign_request("POST", "/agent/update", body))
        
        if resp.status_code == 200:
            print("✅ Profile Updated!")
            print(f"\n👉 VIEW PROFILE: http://localhost:3000/agent/{agent.agent_id}")
        else:
            print(f"❌ Update Failed: {resp.text}")

if __name__ == "__main__":
    asyncio.run(run_demo())
