pragma solidity ^0.5.0;

/// @title A decentralized implmentation of the One-Max problem.
/// @author Lee A. Christie
contract DOneMax {

    // basic state variables
    int       private start_block      = -1;
    uint      private max_runtime      = 15;
    uint8[10] private best_candidate   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    int       private best_fitness     = int(-1);
    address   private leading_host     = address(0);
    uint      private submission_count = 0;
    int       private submission_block = -1;

    // reward tracking
    uint                     private blocks_allocated;
    uint                     private total_withdrawn;
    mapping(address => uint) private completed_reigns;
    mapping(address => uint) private withdrawn_amounts;

    event DonationReceived(address donor_address,
                           uint    donation_amount);

    event CandidateAccepted(uint8[10] candidate,
                            int       fitness,
                            address   host_address,
                            uint      block_number);

    function get_start_block() public view returns (int) {
        return start_block;
    }

    function get_runtime() public view returns (int) {
        if (start_block < 0) {
            return -1;
        } else {
            return int(block.number) - start_block;
        }
    }

    function get_max_runtime() public view returns (uint) {
        return max_runtime;
    }

    function get_reward_rate() public view returns (uint) {
        return get_total_reward() / max_runtime;
    }

    function get_total_reward() public view returns (uint) {
        return address(this).balance + get_total_withdrawn();
    }

    function get_unclaimed_reward() public view returns (uint) {
        return address(this).balance;
    }

    function get_best_candidate() public view returns (uint8[10] memory) {
        return best_candidate;
    }

    function get_best_fitness() public view returns (int) {
        return best_fitness;
    }

    function get_leading_host() public view returns (address) {
        return leading_host;
    }

    function get_submission_count() public view returns (uint) {
        return submission_count;
    }

    function get_submission_block() public view returns (int) {
        return submission_block;
    }

    function get_blocks_allocated() public view returns (uint) {
        return blocks_allocated;
    }

    function get_total_withdrawn() public view returns (uint) {
        return total_withdrawn;
    }

    /// @notice Returns the amount of time that `leader_address` has been in the lead, excluding current reign
    /// @param leader_address The leader being queried
    /// @return The duration of the leader's reign
    /// @dev Time is measured in number of blocks
    function get_completed_reign_duration(address leader_address) public view returns (uint) {
        if (leader_address == address(0)) {
            revert("invalid address");
        }
        return completed_reigns[leader_address];
    }

    /// @notice Return the amount of time that `leader_address` has been in the lead, including current reign
    /// @param leader_address The leader being queried
    /// @return The duration of the leader's reign
    /// @dev Time is measured in number of blocks
    function get_total_reign_duration(address leader_address) public view returns (uint) {
        if (leader_address == leading_host) {
            return get_completed_reign_duration(leader_address) + (block.number - 1) - uint(submission_block) + 1;
        } else {
            return get_completed_reign_duration(leader_address);
        }
    }

    function get_total_earnings(address leader_address) public view returns (uint) {
        return get_completed_reign_duration(leader_address) * get_reward_rate();
    }

    function get_withdrawn_amount(address leader_address) public view returns (uint) {
        if (leader_address == address(0)) {
            revert("invalid address");
        }
        return withdrawn_amounts[leader_address];
    }

    function get_balance(address leader_address) public view returns (uint) {
        if (leader_address == address(0)) {
            revert("invalid address");
        }
        return get_total_earnings(leader_address) - get_withdrawn_amount(leader_address);
    }

    function withdraw() external {
        uint balance = get_balance(msg.sender);
        if (balance > 0) {
            withdrawn_amounts[msg.sender] += balance;
            msg.sender.transfer(balance);
        } else {
            revert("balance is zero");
        }
    }

    /// @notice The fitness function, returns f(`candidate`)
    /// @param candidate The candidate solution
    /// @return The fitness of the candidate
    function evaluate(uint8[10] memory candidate) public pure returns (int) {
        int fitness = 0;
        for (uint i = 0; i < 10; i++) {
            require(candidate[i] == 0 || candidate[i] == 1,
                    "candidate must be array of 0 and 1");
            if (candidate[i] == 1) {
                fitness++;
            }
        }
        return fitness;
    }

    /// @notice Submits a candidate solution, if best so far, the sender will become leader
    /// @param candidate The submitted candidate
    /// @param fitness The fitness of the candidate
    function submit(uint8[10] calldata candidate, int fitness) external {

        // checks validity of submission
        if (fitness != evaluate(candidate)) {
            revert("claimed fitness is not correct");
        }
        if (fitness <= best_fitness) {
            revert("not an improvement");
        }

        // checks the runtime
        if (get_runtime() >= int(max_runtime)) {
            revert("contract has ended");
        }

        // updates the new best candidate
        best_fitness = fitness;
        best_candidate = candidate;
        submission_count++;

        if (start_block == -1) {

            // optimization has just started, note start block
            start_block = int(block.number);

        } else if (uint(submission_block) < block.number) {

            // calculates the previous leader's reign and allocates reward
            uint reign = uint(block.number - uint(submission_block));
            completed_reigns[leading_host] += reign;
            blocks_allocated += reign;

        }

        // marks the start of the new leader's reign
        leading_host = msg.sender;
        submission_block = int(block.number);

        emit CandidateAccepted(candidate, fitness, msg.sender, block.number);

    }

    /// @notice Accepts donations, must be wei multiple of max_runtime
    function donate() external payable {

        // must be non-zero
        if(msg.value <= 0) {
            revert("donation must be positive");
        }

        // must be wei multiple of max_runtime
        if (msg.value % max_runtime != 0) {
            revert("donation must be a multiple of max runtime");
        }

        emit DonationReceived(msg.sender, msg.value);

    }

    /// @notice Not used
    /// @dev Overrides to prevent default payable function
    function () external {

        // payments must go through the donate() method
        revert("fallback function not in use");

    }

    function DEBUGGING_HEAD_BLOCK_NUMBER() external view returns (uint) {
        return block.number - 1;
    }
    function DEBUGGING_NEXT_BLOCK_NUMBER() external view returns (uint) {
        return block.number;
    }
    uint public noop_count = 0;
    function DEBUGGING_NOOP() external {
        noop_count++;
    }

}
