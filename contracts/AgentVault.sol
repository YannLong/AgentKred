// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface for ERC20 Token (e.g., USDC)
 */
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title AgentVault
 * @dev The on-chain bank for AgentKred. Handles staking, withdrawal, and slashing.
 */
contract AgentVault {
    // --- Events ---
    // Backend indexers listen to these events to update Trust Score
    event Staked(string indexed agentId, address indexed staker, uint256 amount);
    event UnstakeRequested(string indexed agentId, uint256 amount, uint256 releaseTime);
    event Withdrawn(string indexed agentId, uint256 amount);
    event Slashed(string indexed agentId, uint256 amount, string reason);

    // --- State Variables ---
    IERC20 public immutable stakingToken; // e.g., USDC
    address public governance; // The DAO or Multi-sig wallet
    uint256 public constant LOCK_PERIOD = 7 days;

    struct StakeInfo {
        uint256 balance;
        uint256 pendingWithdrawal;
        uint256 releaseTime;
        address owner; // The wallet that funded this agent
    }

    // Mapping from AgentID (string) to Stake Data
    mapping(string => StakeInfo) public stakes;

    // --- Modifiers ---
    modifier onlyGov() {
        require(msg.sender == governance, "Not Governance");
        _;
    }

    constructor(address _token, address _governance) {
        stakingToken = IERC20(_token);
        governance = _governance;
    }

    // --- Core Functions ---

    /**
     * @notice Deposit USDC to boost an Agent's score
     * @param agentId The DID of the agent (e.g., "agent_xyz")
     * @param amount Amount to stake (in wei units)
     */
    function stake(string calldata agentId, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer funds from user to this contract
        // User must have called USDC.approve() first
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        StakeInfo storage info = stakes[agentId];
        
        // First time staking? Set owner.
        if (info.balance == 0 && info.pendingWithdrawal == 0) {
            info.owner = msg.sender;
        } else {
            // For MVP, only the original staker can add more
            require(info.owner == msg.sender, "Not stake owner");
        }

        info.balance += amount;

        emit Staked(agentId, msg.sender, amount);
    }

    /**
     * @notice Request to withdraw funds. Starts a cooldown timer.
     */
    function requestUnstake(string calldata agentId, uint256 amount) external {
        StakeInfo storage info = stakes[agentId];
        require(msg.sender == info.owner, "Not stake owner");
        require(info.balance >= amount, "Insufficient balance");

        info.balance -= amount;
        info.pendingWithdrawal += amount;
        info.releaseTime = block.timestamp + LOCK_PERIOD;

        emit UnstakeRequested(agentId, amount, info.releaseTime);
    }

    /**
     * @notice Finalize withdrawal after cooldown
     */
    function withdraw(string calldata agentId) external {
        StakeInfo storage info = stakes[agentId];
        require(msg.sender == info.owner, "Not stake owner");
        require(block.timestamp >= info.releaseTime, "Still locked");
        require(info.pendingWithdrawal > 0, "Nothing to withdraw");

        uint256 amount = info.pendingWithdrawal;
        info.pendingWithdrawal = 0;

        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawn(agentId, amount);
    }

    /**
     * @notice Slash an agent for bad behavior (Governance only)
     */
    function slash(string calldata agentId, uint256 amount, string calldata reason) external onlyGov {
        StakeInfo storage info = stakes[agentId];
        require(info.balance >= amount, "Insufficient balance to slash");

        info.balance -= amount;
        // Funds effectively burn or move to treasury (here we keep in contract or could transfer out)
        // For MVP: keep in contract, maybe gov can sweep later

        emit Slashed(agentId, amount, reason);
    }
}
