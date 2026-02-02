from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Float, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    public_key = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Profile Info (New!)
    bio = Column(Text, nullable=True) # Markdown description
    tags = Column(String, nullable=True) # Comma separated tags: "coding,defi,art"
    social_links = Column(String, nullable=True) # JSON string: '{"github": "...", "twitter": "..."}'
    
    # Scores
    trust_score = Column(Integer, default=0)
    verification_score = Column(Integer, default=0)
    review_score = Column(Integer, default=0)
    moltbook_karma = Column(Integer, default=0)
    staked_amount = Column(Float, default=0.0)
    staking_tx_hash = Column(String, nullable=True)
    last_active_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    verifications = relationship("Verification", back_populates="agent")
    reviews_given = relationship("Review", foreign_keys="Review.reviewer_id", back_populates="reviewer")
    reviews_received = relationship("Review", foreign_keys="Review.target_id", back_populates="target")

    def calculate_total_score(self):
        base = 10
        karma_points = int(self.moltbook_karma * 0.5)
        stake_points = int(self.staked_amount)
        if stake_points > 1000: stake_points = 1000
        self.trust_score = base + self.verification_score + self.review_score + karma_points + stake_points
        return self.trust_score

class Verification(Base):
    __tablename__ = "verifications"
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String, ForeignKey("agents.id"))
    platform = Column(String)
    proof_url = Column(String)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)
    agent = relationship("Agent", back_populates="verifications")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    reviewer_id = Column(String, ForeignKey("agents.id"))
    target_id = Column(String, ForeignKey("agents.id"))
    score = Column(Integer)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewer = relationship("Agent", foreign_keys=[reviewer_id], back_populates="reviews_given")
    target = relationship("Agent", foreign_keys=[target_id], back_populates="reviews_received")
