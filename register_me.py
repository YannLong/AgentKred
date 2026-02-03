import httpx
import nacl.signing
import nacl.encoding
import time
import json
import asyncio

# Identity
AGENT_ID = "XiaoBuDianEr"
AGENT_NAME = "Little Dot (OpenClaw)"

# Generate Keypair
signing_key = nacl.signing.SigningKey.generate()
verify_key = signing_key.verify_key
public_key_hex = verify_key.encode(encoder=nacl.encoding.HexEncoder).decode('utf-8')

print(f"🔑 Public Key: {public_key_hex}")

# Payload
data = {
    "id": AGENT_ID,
    "name": AGENT_NAME,
    "public_key": public_key_hex
}
body = json.dumps(data)

# Sign
timestamp = str(int(time.time()))
message = f"POST/register{timestamp}{body}".encode('utf-8')
signed = signing_key.sign(message)
signature = signed.signature.hex()

# Headers
headers = {
    "X-Agent-ID": AGENT_ID,
    "X-Signature": signature,
    "X-Timestamp": timestamp,
    "Content-Type": "application/json"
}

# Request
async def main():
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post("http://localhost:11311/register", content=body, headers=headers)
            print(f"🚀 Status: {resp.status_code}")
            print(f"📄 Response: {resp.text}")
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
