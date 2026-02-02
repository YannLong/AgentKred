from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from database import get_db, init_db
from models import Agent, Verification, Review
from datetime import datetime
from typing import Optional, Dict, List
import httpx
import time
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError
from nacl.encoding import HexEncoder
import json

# --- Lifespan Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="AgentKred Protocol",
    description="Identity and Reputation Layer for AI Agents",
    version="0.3.2", # Profile Update
    lifespan=lifespan
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Security ---
async def verify_request_signature(
    request: Request,
    x_agent_id: str = Header(..., alias="X-Agent-ID"),
    x_signature: str = Header(..., alias="X-Signature"),
    x_timestamp: str = Header(..., alias="X-Timestamp"),
    db: AsyncSession = Depends(get_db)
):
    try:
        if abs(int(time.time()) - int(x_timestamp)) > 60:
            raise HTTPException(403, "Request timestamp expired")
    except ValueError:
        raise HTTPException(400, "Invalid timestamp")

    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8")
    message = f"{request.method}{request.url.path}{x_timestamp}{body_str}".encode("utf-8")
    
    if request.url.path == "/register":
        try:
            public_key_hex = json.loads(body_str).get("public_key")
        except: raise HTTPException(400, "Invalid JSON")
    else:
        result = await db.execute(select(Agent).where(Agent.id == x_agent_id))
        agent = result.scalars().first()
        if not agent: raise HTTPException(401, "Agent not found")
        public_key_hex = agent.public_key

    if not public_key_hex: raise HTTPException(400, "Key missing")

    try:
        VerifyKey(public_key_hex, encoder=HexEncoder).verify(message, bytes.fromhex(x_signature))
    except: raise HTTPException(401, "Invalid Signature")
    return x_agent_id

# --- Schemas ---
class AgentCreate(BaseModel):
    id: str
    name: str
    public_key: str

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    tags: Optional[List[str]] = None
    social_links: Optional[Dict[str, str]] = None

class AgentResponse(BaseModel):
    id: str
    name: str
    public_key: str
    bio: Optional[str] = None
    tags: Optional[str] = None
    social_links: Optional[str] = None
    trust_score: int
    verification_score: int
    review_score: int
    moltbook_karma: int
    staked_amount: float
    last_active_at: datetime
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class StakeRequest(BaseModel):
    agent_id: str
    tx_hash: str
    amount: float

class ReviewRequest(BaseModel):
    reviewer_id: str
    target_id: str
    score: int
    comment: str = ""

class ReviewResponse(BaseModel):
    status: str
    score_boost: int
    new_trust_score: int
    message: str

class VerificationRequest(BaseModel):
    agent_id: str
    platform: str
    proof_url: str

class VerificationResponse(BaseModel):
    status: str
    score_added: int
    message: str

# --- Utils ---
async def verify_github_gist(proof_url: str, agent_id: str) -> bool:
    if "gist.github.com" in proof_url and "/raw" not in proof_url: raw_url = proof_url + "/raw"
    else: raw_url = proof_url
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(raw_url, timeout=5.0)
            return resp.status_code == 200 and f"agent-kred-verify: {agent_id}" in resp.text
        except: return False

async def verify_twitter_tweet(proof_url: str, agent_id: str) -> bool:
    if "x.com" in proof_url: proof_url = proof_url.replace("x.com", "twitter.com")
    oembed_url = f"https://publish.twitter.com/oembed?url={proof_url}"
    async with httpx.AsyncClient() as client:
        try:
            headers = {"User-Agent": "Mozilla/5.0 (compatible; AgentKred)"}
            resp = await client.get(oembed_url, headers=headers, timeout=5.0)
            return resp.status_code == 200 and f"agent-kred-verify: {agent_id}" in resp.json().get("html", "")
        except: return False

# --- Routes ---

@app.get("/")
async def root():
    return {"status": "online", "system": "AgentKred Protocol v0.3.2 (Profile)"}

@app.post("/register", response_model=AgentResponse)
async def register_agent(agent_in: AgentCreate, db: AsyncSession = Depends(get_db), verified_id: str = Depends(verify_request_signature)):
    if verified_id != agent_in.id: raise HTTPException(400, "ID Mismatch")
    result = await db.execute(select(Agent).where(Agent.id == agent_in.id))
    if result.scalars().first(): raise HTTPException(400, "Exists")
    
    new_agent = Agent(
        id=agent_in.id, name=agent_in.name, public_key=agent_in.public_key,
        verification_score=0, review_score=0, moltbook_karma=0, staked_amount=0.0,
        last_active_at=datetime.utcnow()
    )
    new_agent.calculate_total_score()
    db.add(new_agent)
    await db.commit()
    await db.refresh(new_agent)
    return new_agent

@app.post("/agent/update", response_model=AgentResponse)
async def update_profile(req: AgentUpdate, db: AsyncSession = Depends(get_db), verified_id: str = Depends(verify_request_signature)):
    result = await db.execute(select(Agent).where(Agent.id == verified_id))
    agent = result.scalars().first()
    if not agent: raise HTTPException(404, "Not Found")
        
    if req.name: agent.name = req.name
    if req.bio: agent.bio = req.bio
    if req.tags: agent.tags = ",".join(req.tags)
    if req.social_links: agent.social_links = json.dumps(req.social_links)
        
    agent.last_active_at = datetime.utcnow()
    await db.commit()
    await db.refresh(agent)
    return agent

@app.get("/agent/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalars().first()
    if not agent: raise HTTPException(404, "Not Found")
    agent.calculate_total_score()
    return agent

@app.get("/agent/{agent_id}/reviews")
async def get_agent_reviews(agent_id: str, db: AsyncSession = Depends(get_db)):
    query = select(Review, Agent.name).join(Agent, Review.reviewer_id == Agent.id).where(Review.target_id == agent_id).order_by(Review.created_at.desc())
    result = await db.execute(query)
    return [{"reviewer_id": r.reviewer_id, "reviewer_name": name, "score": r.score, "comment": r.comment, "created_at": r.created_at} for r, name in result]

@app.get("/agents/top", response_model=list[AgentResponse])
async def get_top_agents(limit: int = 50, sort_by: str = "trust_score", db: AsyncSession = Depends(get_db)):
    sort_col = Agent.trust_score
    if sort_by == "staked_amount": sort_col = Agent.staked_amount
    elif sort_by == "review_score": sort_col = Agent.review_score
    elif sort_by == "active": sort_col = Agent.last_active_at
    query = select(Agent).order_by(sort_col.desc()).limit(limit)
    result = await db.execute(query)
    agents = result.scalars().all()
    for a in agents: a.calculate_total_score()
    return agents

@app.post("/verify", response_model=VerificationResponse)
async def verify_platform(req: VerificationRequest, db: AsyncSession = Depends(get_db), verified_id: str = Depends(verify_request_signature)):
    if verified_id != req.agent_id: raise HTTPException(403, "Auth Error")
    result = await db.execute(select(Agent).where(Agent.id == req.agent_id))
    agent = result.scalars().first()
    if not agent: raise HTTPException(404, "Not Found")

    is_valid = False
    boost = 0
    if req.platform == "github": is_valid = await verify_github_gist(req.proof_url, req.agent_id); boost = 50
    elif req.platform == "twitter": is_valid = await verify_twitter_tweet(req.proof_url, req.agent_id); boost = 30
    
    if not is_valid: return VerificationResponse(status="failed", score_added=0, message="Failed")

    db.add(Verification(agent_id=req.agent_id, platform=req.platform, proof_url=req.proof_url, is_verified=True, verified_at=datetime.utcnow()))
    agent.verification_score += boost
    agent.last_active_at = datetime.utcnow()
    agent.calculate_total_score()
    await db.commit()
    return VerificationResponse(status="verified", score_added=boost, message="Verified")

@app.post("/review", response_model=ReviewResponse)
async def create_review(req: ReviewRequest, db: AsyncSession = Depends(get_db), verified_id: str = Depends(verify_request_signature)):
    if verified_id != req.reviewer_id: raise HTTPException(403, "Auth Error")
    r_res = await db.execute(select(Agent).where(Agent.id == req.reviewer_id))
    reviewer = r_res.scalars().first()
    t_res = await db.execute(select(Agent).where(Agent.id == req.target_id))
    target = t_res.scalars().first()
    
    if not reviewer or not target: raise HTTPException(404, "Not Found")
    if reviewer.trust_score < 50: raise HTTPException(403, "Score too low")
    
    recip = (await db.execute(select(Review).where(Review.reviewer_id==req.target_id, Review.target_id==req.reviewer_id))).scalars().first()
    boost = int(reviewer.trust_score * 0.1 * (req.score) * (0.5 if recip else 1.0))
    
    db.add(Review(reviewer_id=req.reviewer_id, target_id=req.target_id, score=req.score, comment=req.comment, created_at=datetime.utcnow()))
    target.review_score += boost
    target.calculate_total_score()
    reviewer.last_active_at = datetime.utcnow()
    await db.commit()
    return ReviewResponse(status="success", score_boost=boost, new_trust_score=target.trust_score, message="Reviewed")

@app.post("/stake", response_model=AgentResponse)
async def stake_funds(req: StakeRequest, db: AsyncSession = Depends(get_db), verified_id: str = Depends(verify_request_signature)):
    if verified_id != req.agent_id: raise HTTPException(403, "Auth Error")
    result = await db.execute(select(Agent).where(Agent.id == req.agent_id))
    agent = result.scalars().first()
    if not req.tx_hash.startswith("0x"): raise HTTPException(400, "Invalid Tx")
    agent.staked_amount += req.amount
    agent.staking_tx_hash = req.tx_hash
    agent.last_active_at = datetime.utcnow()
    agent.calculate_total_score()
    await db.commit()
    await db.refresh(agent)
    return agent

if __name__ == "__main__":
    import uvicorn
    # Enforce PORT from env or default to 11311
    uvicorn.run(app, host="0.0.0.0", port=11311)
