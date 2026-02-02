# ... (Previous imports)
from typing import Optional, Dict

# ... (Previous code)

# --- Schemas ---
class AgentUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    tags: Optional[list[str]] = None
    social_links: Optional[Dict[str, str]] = None # {"github": "url", "twitter": "url"}

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

# ... (Previous routes)

@app.post("/agent/update", response_model=AgentResponse)
async def update_profile(
    req: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    verified_id: str = Depends(verify_request_signature)
):
    """
    Update Agent Profile (Bio, Tags, Socials). Requires Signature.
    """
    result = await db.execute(select(Agent).where(Agent.id == verified_id))
    agent = result.scalars().first()
    if not agent:
        raise HTTPException(404, "Agent not found")
        
    if req.name: agent.name = req.name
    if req.bio: agent.bio = req.bio
    if req.tags: agent.tags = ",".join(req.tags)
    if req.social_links: 
        import json
        agent.social_links = json.dumps(req.social_links)
        
    agent.last_active_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(agent)
    return agent

# ... (Previous code)
