const BigNumber = require('bignumber.js');

const DOneMax = artifacts.require("./DOneMax.sol");

async function height(contract) {
    return (await contract.DEBUGGING_HEAD_BLOCK_NUMBER.call()).toNumber();
}

async function sleep(contract, accounts, blocks) {
    for (let i = 0; i < blocks; i++) {
        await contract.DEBUGGING_NOOP({from : accounts[0]});
    }
}

contract("DOneMax", accounts => {

    it("should evaluate fitnesses correctly", async () => {

        const contract = await DOneMax.new();

        // check ten different fitness examples
        assert.equal(await contract.evaluate.call([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 0);
        assert.equal(await contract.evaluate.call([0, 0, 1, 0, 0, 0, 0, 0, 0, 0]), 1);
        assert.equal(await contract.evaluate.call([0, 0, 0, 0, 1, 0, 1, 0, 0, 0]), 2);
        assert.equal(await contract.evaluate.call([0, 0, 1, 0, 1, 0, 0, 0, 1, 0]), 3);
        assert.equal(await contract.evaluate.call([1, 0, 0, 0, 0, 0, 0, 1, 1, 1]), 4);
        assert.equal(await contract.evaluate.call([0, 0, 1, 0, 0, 1, 0, 1, 1, 1]), 5);
        assert.equal(await contract.evaluate.call([1, 1, 0, 1, 1, 0, 0, 0, 1, 1]), 6);
        assert.equal(await contract.evaluate.call([1, 1, 0, 1, 1, 1, 1, 1, 0, 0]), 7);
        assert.equal(await contract.evaluate.call([0, 1, 1, 1, 1, 1, 0, 1, 1, 1]), 8);
        assert.equal(await contract.evaluate.call([1, 0, 1, 1, 1, 1, 1, 1, 1, 1]), 9);
        assert.equal(await contract.evaluate.call([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), 10);

    });

    it("should begin with expected defaults", async () => {

        const contract = await DOneMax.new();

        // check defaults
        assert.equal(await contract.get_start_block.call(), -1);
        assert.equal(await contract.get_max_runtime.call(), 15);
        assert.deepEqual((await contract.get_best_candidate.call()).map(e => e.toNumber()),
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        assert.equal(await contract.get_best_fitness.call(), -1);
        assert.equal(await contract.get_leading_host.call(), 0);
        assert.equal(await contract.get_submission_count.call(), 0);
        assert.equal(await contract.get_submission_block.call(), -1);
        assert.equal(await contract.get_runtime.call(), -1);
        assert.equal(await contract.get_blocks_allocated.call(), 0);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 0);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[1]), 0);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[2]), 0);
        assert.equal(await contract.get_total_withdrawn.call(), 0);
        assert.equal(await contract.get_total_reward.call(), 0);
        assert.equal(await contract.get_unclaimed_reward.call(), 0);
        assert.equal(await contract.get_total_earnings.call(accounts[0]), 0);
        assert.equal(await contract.get_total_earnings.call(accounts[1]), 0);
        assert.equal(await contract.get_total_earnings.call(accounts[2]), 0);
        assert.equal(await contract.get_withdrawn_amount.call(accounts[0]), 0);
        assert.equal(await contract.get_withdrawn_amount.call(accounts[1]), 0);
        assert.equal(await contract.get_withdrawn_amount.call(accounts[2]), 0);
        assert.equal(await contract.get_balance.call(accounts[0]), 0);
        assert.equal(await contract.get_balance.call(accounts[1]), 0);
        assert.equal(await contract.get_balance.call(accounts[2]), 0);

    });

    it("should accept 0 fitness", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});
       
        // check that fitness is 0 with one submission
        assert.equal(await contract.get_best_fitness.call(), 0);
        assert.equal(await contract.get_submission_count.call(), 1);

    });

    it("should accept 1 fitness", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 1, 0, 0, 0, 0], 1,
                              {from : accounts[0]});
       
        // check that fitness is 1 with one submission
        assert.equal(await contract.get_best_fitness.call(), 1);
        assert.equal(await contract.get_submission_count.call(), 1);

    });

    it("should accept 0, then 1 fitness", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 1, 0], 1,
                              {from : accounts[0]});
       
        // check that fitness is 1 with two submissions
        assert.equal(await contract.get_best_fitness.call(), 1);
        assert.equal(await contract.get_submission_count.call(), 2);

    });

    it("should accept 1, then reject 0 fitness", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 1, 0], 1,
                              {from : accounts[0]});

        // check that "not an improvement" is thrown
        let error = null;
        try {
            await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                                  {from : accounts[0]});
        } catch (e) {
            error = String(e);
        }
        assert.isNotNull(error);
        assert.include(error, "not an improvement");

    });

    it("should catch false fitness", async () => {

        const contract = await DOneMax.new();

        // check that "claimed fitness is not correct" is thrown
        let error = null;
        try {
            await contract.submit([0, 0, 0, 0, 1, 0, 1, 0, 0, 0], 5,
                                  {from : accounts[0]});
        } catch (e) {
            error = String(e);
        }
        assert.isNotNull(error);
        assert.include(error, "claimed fitness is not correct");

    });
    
    it("should switch leading hosts", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});

        // check that account 0 is leading
        assert.equal(await contract.get_leading_host.call(), accounts[0]);
        
        await contract.submit([0, 0, 0, 0, 0, 0, 1, 0, 0, 0], 1,
                              {from : accounts[1]});

        // check that account 1 is leading
        assert.equal(await contract.get_leading_host.call(), accounts[1]);

    });
    
    it("should switch best candidates", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});

        // check that account 000...00 is best
        assert.deepEqual((await contract.get_best_candidate.call()).map(e => e.toNumber()),
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 1,
                              {from : accounts[1]});

        // check that account 000...01 is best
        assert.deepEqual((await contract.get_best_candidate.call()).map(e => e.toNumber()),
                         [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

    });
    
    it("should count submissions", async () => {

        const contract = await DOneMax.new();
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 1,
                              {from : accounts[1]});

        // check that there have been 2 submissions
        assert.equal(await contract.get_submission_count.call(), 2);
        
        await contract.submit([0, 1, 0, 1, 0, 1, 0, 0, 0, 0], 3,
                              {from : accounts[0]});
        await contract.submit([0, 0, 0, 0, 1, 1, 1, 1, 1, 1], 6,
                              {from : accounts[1]});
        await contract.submit([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 10,
                              {from : accounts[0]});

        // check that there have been 5 submissions
        assert.equal(await contract.get_submission_count.call(), 5);

    });

    it("should acccept a small donation", async () => {
        
        const contract = await DOneMax.new();

        await contract.donate({from: accounts[0], value: 105});
        
        // check that the balance has updated
        assert.equal(await contract.get_total_reward.call(), 105);

    });

    it("should acccept a large donation", async () => {
        
        const contract = await DOneMax.new();

        await contract.donate({from: accounts[0], value: BigNumber("91000000000000110")});
        
        // check that the balance has updated
        assert.equal(await contract.get_total_reward.call(), "91000000000000110");

    });

    it("should reject an indivisible donation", async () => {
        
        const contract = await DOneMax.new();

        // check that "donation must be a multiple of max runtime" is thrown
        let error = null;
        try {
            await contract.donate({from: accounts[0], value: 11111});
        } catch (e) {
            error = String(e);
        }
        assert.isNotNull(error);
        assert.include(error, "donation must be a multiple of max runtime");

    });

    it("should reject zero donation", async () => {
        
        const contract = await DOneMax.new();

        // check that "donation must be positive" is thrown
        let error = null;
        try {
            await contract.donate({from: accounts[0], value: 0});
        } catch (e) {
            error = String(e);
        }
        assert.isNotNull(error);
        assert.include(error, "donation must be positive");

    });

    it("should mine a block for each submission and sleep", async () => {
        
        const contract = await DOneMax.new();
        const block = await height(contract);

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});
        
        // check the block number advanced by one
        assert.equal(await height(contract), block + 1);

        await contract.submit([0, 0, 0, 0, 1, 0, 0, 0, 0, 0], 1,
                              {from : accounts[0]});
        await sleep(contract, accounts, 1);
        
        // check the block number advanced by a further two
        assert.equal(await height(contract), block + 3);

    });

    it("should record start block number", async () => {
        
        const contract = await DOneMax.new();
        const block = await height(contract);
        
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});
        
        // check the start block was set to the new head
        assert.equal((await contract.get_start_block.call()).toNumber(), block + 1);

    });

    it("should update block number not start block number", async () => {
        
        const contract = await DOneMax.new();
        const block = await height(contract);

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // transaction 1
                              {from : accounts[0]});

        // check both variables set to new block height
        assert.equal(await contract.get_start_block.call(), block + 1);
        assert.equal(await contract.get_submission_block.call(), block + 1);

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,    // transaction 2
                              {from : accounts[0]});

        // check only submission block set to new block height
        assert.equal(await contract.get_start_block.call(), block + 1);
        assert.equal(await contract.get_submission_block.call(), block + 2);

        await sleep(contract, accounts, 7);                         // transaction 3-9
        await contract.submit([0, 0, 0, 1, 0, 0, 0, 0, 0, 1], 2,    // transaction 10
                              {from : accounts[0]});

        // check only submission block set to new block height
        assert.equal(await contract.get_start_block.call(), block + 1);
        assert.equal(await contract.get_submission_block.call(), block + 10);

    });

    it("should emit events on submittion", async () => {
        
        const contract = await DOneMax.new();
        const block = await height(contract);

        const tx1 = await contract.submit([0, 0, 1, 0, 0, 0, 1, 0, 1, 0], 3,
                                          {from : accounts[0]});

        // check that the correct event was emmited
        assert.equal(tx1.logs.length, 1);
        assert.equal(tx1.logs[0].event, "CandidateAccepted");
        assert.equal(tx1.logs[0].args.fitness, 3);
        assert.deepEqual(tx1.logs[0].args.candidate.map(e => e.toNumber()),
                         [0, 0, 1, 0, 0, 0, 1, 0, 1, 0]);
        assert.equal(tx1.logs[0].args.host_address, accounts[0]);
        assert.equal(tx1.logs[0].args.block_number, block + 1);

        const tx2 = await contract.submit([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 10,
                                          {from : accounts[1]});

        // check that the correct event was emmited
        assert.equal(tx2.logs.length, 1);
        assert.equal(tx2.logs[0].event, "CandidateAccepted");
        assert.equal(tx2.logs[0].args.fitness, 10);
        assert.deepEqual(tx2.logs[0].args.candidate.map(e => e.toNumber()),
                         [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
        assert.equal(tx2.logs[0].args.host_address, accounts[1]);
        assert.equal(tx2.logs[0].args.block_number, block + 2);

    });

    it("should emit events on donation", async () => {
        
        const contract = await DOneMax.new();

        const tx1 = await contract.donate({from: accounts[0], value: 105});

        // check that the correct event was emmited
        assert.equal(tx1.logs.length, 1);
        assert.equal(tx1.logs[0].event, "DonationReceived");
        assert.equal(tx1.logs[0].args.donor_address, accounts[0]);
        assert.equal(tx1.logs[0].args.donation_amount, 105);

        const tx2 = await contract.donate({from: accounts[1], value: 1005});

        // check that the correct event was emmited
        assert.equal(tx2.logs.length, 1);
        assert.equal(tx2.logs[0].event, "DonationReceived");
        assert.equal(tx2.logs[0].args.donor_address, accounts[1]);
        assert.equal(tx2.logs[0].args.donation_amount, 1005);

    });

    it("should not update allocation on first submittion", async () => {
        
        const contract = await DOneMax.new();

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // not counted
                              {from : accounts[0]});
        
        // check that blocked allocated did not change
        assert.equal(await contract.get_blocks_allocated.call(), 0);

    });

    it("should update allocation on second submittion", async () => {
        
        const contract = await DOneMax.new();

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // not counted
                              {from : accounts[0]});

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,    // counted transaction 1
                            {from : accounts[0]});
        
        // check that blocked allocated changed
        assert.equal(await contract.get_blocks_allocated.call(), 1);

    });

    it("should use block numbers to count allocation", async () => {
        
        const contract = await DOneMax.new();

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // not counted
            {from : accounts[0]});

        await sleep(contract, accounts, 1);                         // counted transaction 1

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,    // counted transaction 2
                {from : accounts[0]});

        // check that blocked allocated changed
        assert.equal(await contract.get_blocks_allocated.call(), 2);

        await sleep(contract, accounts, 4);                         // counted transaction 3-6

        await contract.submit([0, 0, 0, 1, 1, 0, 0, 0, 0, 0], 2,    // counted transaction 7
        {from : accounts[0]});

        // check that blocked allocated changed
        assert.equal(await contract.get_blocks_allocated.call(), 7);

    });

    it("should update completed reign mapping on second submittion", async () => {
        
        const contract = await DOneMax.new();

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // not counted
                              {from : accounts[0]});

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,    // counted transaction 1
                            {from : accounts[1]});
        
        // check that completed reign mapping changed
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 1);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[1]), 0);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[2]), 0);

    });

    it("should use block numbers to update completed reign mapping", async () => {
        
        const contract = await DOneMax.new();

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // block 1 of account 0 reign
                              {from : accounts[0]});

        await sleep(contract, accounts, 1);                         // block 2 of account 0 reign

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,    // block 1 of account 1 reign
                              {from : accounts[1]});

        // check that completed reign mapping changed
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 2);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[1]), 0);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[2]), 0);

        await sleep(contract, accounts, 4);                         // block 2-5 of account 1 reign

        await contract.submit([0, 0, 0, 1, 1, 0, 0, 0, 0, 0], 2,    // block 1 of account 2 reign
                              {from : accounts[2]});

        // check that completed reign mapping changed
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 2);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[1]), 5);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[2]), 0);

    });

    it("should include current reign in reign totals", async () => {
        
        const contract = await DOneMax.new();

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,    // block 1 of account 0 reign
                              {from : accounts[0]});

        // check that completed reign mapping changed
        assert.equal(await contract.get_total_reign_duration.call(accounts[0]), 1);
        assert.equal(await contract.get_total_reign_duration.call(accounts[1]), 0);
        assert.equal(await contract.get_total_reign_duration.call(accounts[2]), 0);

        await sleep(contract, accounts, 1);                         // block 2 of account 0 reign

        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,    // block 1 of account 1 reign
                              {from : accounts[1]});

        // check that completed reign mapping changed
        assert.equal(await contract.get_total_reign_duration.call(accounts[0]), 2);
        assert.equal(await contract.get_total_reign_duration.call(accounts[1]), 1);
        assert.equal(await contract.get_total_reign_duration.call(accounts[2]), 0);

        await sleep(contract, accounts, 4);                         // block 2-5 of account 1 reign

        await contract.submit([0, 0, 0, 1, 1, 0, 0, 0, 0, 0], 2,    // block 1 of account 2 reign
                              {from : accounts[2]});

        // check that completed reign mapping changed
        assert.equal(await contract.get_total_reign_duration.call(accounts[0]), 2);
        assert.equal(await contract.get_total_reign_duration.call(accounts[1]), 5);
        assert.equal(await contract.get_total_reign_duration.call(accounts[2]), 1);

    });

    it("should calculate current runtime before and during run", async () => {
        
        const contract = await DOneMax.new();

        // Always -1 before start
        assert.equal(await contract.get_runtime.call(), -1);
        await sleep(contract, accounts, 1);
        assert.equal(await contract.get_runtime.call(), -1);
        await sleep(contract, accounts, 10);
        assert.equal(await contract.get_runtime.call(), -1);

        // 1 after first submission
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
                              {from : accounts[0]});
        assert.equal(await contract.get_runtime.call(), 1);

        // 2 after sleep
        await sleep(contract, accounts, 1);
        assert.equal(await contract.get_runtime.call(), 2);

        // 3 after second submisson
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,
                              {from : accounts[1]});
        assert.equal(await contract.get_runtime.call(), 3);

    });

    it("should calculate completed reign duration", async () => {

        const contract = await DOneMax.new();

        // starts 0
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 0);

        // still 0 aftr submission
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0,
            {from : accounts[0]});
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 0);
        
        // still 0 after sleep
        await sleep(contract, accounts, 1);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 0);

        // switches to 2 after a competitor submits
        await contract.submit([0, 0, 0, 0, 0, 0, 0, 1, 0, 0], 1,
                              {from : accounts[1]});
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 2);

        // second switches to 1 after a competitor submits
        await contract.submit([0, 0, 0, 1, 0, 0, 0, 1, 0, 0], 2,
                              {from : accounts[0]});
        assert.equal(await contract.get_completed_reign_duration.call(accounts[1]), 1);
        
        // first still 2 after sleep
        await sleep(contract, accounts, 3);
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 2);

        // first switches to 5 after a competitor submits
        await contract.submit([0, 0, 0, 1, 0, 0, 0, 1, 1, 0], 3,
                              {from : accounts[1]});
        assert.equal(await contract.get_completed_reign_duration.call(accounts[0]), 6);

    });

    it("should calculate total reward", async () => {

        const MAX_RUNTIME = 15;

        const contract = await DOneMax.new();

        // default 0
        assert.equal(await contract.get_total_reward.call(), 0);

        // add 10 / time unit
        await contract.donate({from: accounts[0], value: 10 * MAX_RUNTIME});
        assert.equal(await contract.get_total_reward.call(), 10 * MAX_RUNTIME);

        // add 100 / time unit
        await contract.donate({from: accounts[0], value: 100 * MAX_RUNTIME});
        assert.equal(await contract.get_total_reward.call(), 110 * MAX_RUNTIME); // 100 + 10

    });

    it("should match unclaimed reward to total reward if no claims made", async () => {

        const MAX_RUNTIME = 15;

        const contract = await DOneMax.new();

        // default 0
        assert.equal(await contract.get_unclaimed_reward.call(), 0);

        // add 10 / time unit
        await contract.donate({from: accounts[0], value: 10 * MAX_RUNTIME});
        assert.equal(await contract.get_unclaimed_reward.call(), 10 * MAX_RUNTIME);

        // add 100 / time unit
        await contract.donate({from: accounts[0], value: 100 * MAX_RUNTIME});
        assert.equal(await contract.get_unclaimed_reward.call(), 110 * MAX_RUNTIME); // 100 + 10

    });

    it("should calculate reward rate", async () => {

        const MAX_RUNTIME = 15;

        const contract = await DOneMax.new();

        // default 0
        assert.equal(await contract.get_reward_rate.call(), 0);

        // add 10 / time unit
        await contract.donate({from: accounts[0], value: 10 * MAX_RUNTIME});
        assert.equal(await contract.get_reward_rate.call(), 10);

        // add 100 / time unit
        await contract.donate({from: accounts[0], value: 100 * MAX_RUNTIME});
        assert.equal(await contract.get_reward_rate.call(), 110); // 100 + 10

    });

    //it("TODO", async () => {
    //    
    //    console.warn("TODO: test get_total_reign_duration()");
    //    console.warn("TODO: test get_total_withdrawn()");
    //    console.warn("TODO: test get_total_earnings(address)");
    //    console.warn("TODO: test get_withdrawn_amount(adddress)");
    //    console.warn("TODO: test get_balance(address)");
    //    console.warn("TODO: test withdraw()");
    //    console.warn("TODO: test get_unclaimed_reward() - when claims are made");
    //
    //});

});
