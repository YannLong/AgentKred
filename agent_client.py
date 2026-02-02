import httpx
import asyncio
from nacl.signing import SigningKey
from nacl.encoding import HexEncoder
import json
import os

# --- Configuration ---
API_URL = "http://localhost:8002"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") # Optional: Real automation needs this

async def run_autonomous_agent():
    print("🤖 [AutoBot] Booting up... Initializing Autonomous Sequence.")
    
    # 1. Generate Identity (Self-Sovereign)
    print("🔑 [AutoBot] Generating Ed25519 Keypair...")
    signing_key = SigningKey.generate()
    verify_key = signing_key.verify_key
    public_key_hex = verify_key.encode(encoder=HexEncoder).decode('utf-8')
    agent_id = f"agent_auto_{public_key_hex[:8]}"
    
    print(f"   -> My ID: {agent_id}")
    print(f"   -> My Public Key: {public_key_hex[:16]}...")

    # 2. Register Identity
    print("\n📝 [AutoBot] Registering with AgentKred Protocol...")
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                f"{API_URL}/register",
                json={
                    "id": agent_id,
                    "name": "AutoBot-X",
                    "public_key": public_key_hex
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                print(f"   ✅ Registration Success! Trust Score: {data['trust_score']}")
            else:
                print(f"   ❌ Registration Failed: {resp.text}")
                return
        except Exception as e:
            print(f"   ❌ Connection Error: {e}")
            return

        # 3. Autonomous Verification (Simulated or Real)
        if GITHUB_TOKEN:
            print("\n🐙 [AutoBot] Detected GitHub Token. Attempting real Gist verification...")
            # Real Gist Creation Logic via GitHub API
            gist_payload = {
                "description": "AgentKred Identity Proof",
                "public": True,
                "files": {
                    "proof.txt": {
                        "content": f"agent-kred-verify: {agent_id}"
                    }
                }
            }
            
            # Create Gist
            g_resp = await client.post(
                "https://api.github.com/gists",
                json=gist_payload,
                headers={
                    "Authorization": f"token {GITHUB_TOKEN}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "AgentKred-AutoBot"
                }
            )
            
            if g_resp.status_code == 201:
                gist_data = g_resp.json()
                gist_url = gist_data["html_url"]
                print(f"   ✅ Gist Created: {gist_url}")
                
                # Verify
                print("   🔍 Submitting proof to AgentKred...")
                v_resp = await client.post(
                    f"{API_URL}/verify",
                    json={
                        "agent_id": agent_id,
                        "platform": "github",
                        "proof_url": gist_url
                    }
                )
                print(f"   🎉 Verification Result: {v_resp.json()}")
            else:
                print(f"   ❌ Failed to create Gist: {g_resp.status_code}")
                
        else:
            print("\n⚠️ [AutoBot] No GITHUB_TOKEN found. Skipping real verification.")
            print("   (To test real verification, set export GITHUB_TOKEN=... and run again)")

if __name__ == "__main__":
    asyncio.run(run_autonomous_agent())
