import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import BuyWithUsdtModal from './buyWithUsdtModal';
import CreditCardModal from './CreditCardModal';
import ReferralModal from './ReferralModal';
import StatsModal from './StatsModal';
import KombatModal from './KombatModal';
import ResumeModal from './ResumeModal';

function UserVesting({ userVestingData, userAddress, telegramCode, apiKey }) {
    if (!userVestingData) {
        return null;
    }

    const userVestingSplit = userVestingData.toString().split(',');
    let counter = 0;
    const totalAmount = userVestingSplit[counter++];
    const claimedAmount = userVestingSplit[counter++];
    const claimStart = new Date(userVestingSplit[counter++] * 1000);
    const claimEnd = new Date(userVestingSplit[counter++] * 1000);
    const secretKeyPart = userAddress.slice(-6);
    const [showKey, setShowKey] = useState(false);
    const toggleKeyVisibility = () => setShowKey(!showKey);

    return (
        <div id="toast-simple" className="flex justify-center items-center p-4 space-x-4 w-full max-w-xs text-white bg-neutral-800 rounded-lg divide-x divide-gray-200 shadow space-x" role="alert">
            <div className="pl-4 text-sm font-normal">
                You own {new Intl.NumberFormat().format(totalAmount)} Credits<br />
                Refer link: <br /> <a href={`https://context-pilot.xyz/${secretKeyPart}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">https://context-pilot.xyz/{showKey ? secretKeyPart : "****"}</a><br />
                {telegramCode && (
                    <>
                        Telegram code: {showKey ? telegramCode : "****"} 
                        <a href="https://doc.context-pilot.xyz/getting-started/use-pilot-kombat" target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 underline">doc</a><br />
                    </>
                )}
                Secret key: {showKey ? apiKey : "****"}
                <button onClick={toggleKeyVisibility} className="pl-2 text-blue-500">{showKey ? "Hide" : "Show"}</button>
            </div>
        </div>
    );
}

export default function SeedSale({ slug }) {
    const { address: useAccountAddress, isConnected: useAccountIsConnected } = useAccount();
    const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);
    const [allowedTokens, setAllowedTokens] = useState(0);
    const [usedTokens, setUsedTokens] = useState(0);
    const [presaleDataParsed, setPresaleDataParsed] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);
    const [referredBy, setReferredBy] = useState(null);
    const [loadingAirdrop, setLoadingAirdrop] = useState(false);
    const [loadingReferData, setLoadingReferData] = useState(false);
    const [airdropResult, setAirdropResult] = useState(null); // Added state for airdrop result
    const [airdropError, setAirdropError] = useState(null);
    const [showAirdropMessage, setShowAirdropMessage] = useState(false);
    const { chain } = useAccount();
    const [contractAddress, setContractAddress] = useState(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    const [abi, setAbi] = useState(process.env.NEXT_PUBLIC_CONTRACT_ABI);
    const [presaleId, setPresaleId] = useState(process.env.NEXT_PUBLIC_PRESALE_ID);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
    const [referredCreditScores, setReferredCreditScores] = useState({});
    const [referredBonuses, setReferredBonuses] = useState({});
    const [referredIds, setReferredIds] = useState({});
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
    const handleOpenResumeModal = () => setIsResumeModalOpen(true);
    const handleCloseResumeModal = () => setIsResumeModalOpen(false);

    const handleOpenStatsModal = () => setIsStatsModalOpen(true);
    const handleCloseStatsModal = () => setIsStatsModalOpen(false);

    const [isKombatModalOpen, setIsKombatModalOpen] = useState(false); // Add state for KombatModal

    const handleOpenKombatModal = () => {
        setIsKombatModalOpen(true); // Open KombatModal
    };

    const handleCloseKombatModal = () => {
        setIsKombatModalOpen(false); // Close KombatModal
    };

    function Log(stringToLog) {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        console.log(today.toUTCString() + " | " + stringToLog);
    }

    const [userTelegramCode, setUserTelegramCode] = useState(null);
    const [userApiKey, setUserApiKey] = useState(null);
    const [presaleDataMultiChain, setPresaleDataMultiChain] = useState(null);

    // Fetch the telegram code
    useEffect(() => {
        if (!useAccountAddress) return;

        async function fetchTelegramCode() {
            try {
                const response = await fetch(`https://main-wjaxre4ena-uc.a.run.app/get_telegram_code?address=${useAccountAddress}`);
                if (!response.ok) {
                    throw new Error("Error fetching Telegram code");
                }
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                setUserTelegramCode(data.telegram_code);
            } catch (error) {
                console.error("Failed to fetch Telegram code:", error);
            }
        }

        fetchTelegramCode();
    }, [useAccountAddress]);

    async function fetchApiUsage(address) {
        try {
            const response = await fetch(`https://main-wjaxre4ena-uc.a.run.app/api_usage?address=${address}`);
            if (!response.ok) {
                throw new Error("Error fetching API usage");
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.error("Failed to fetch API usage:", error);
            return { allowed_tokens: 0, used_tokens: 0, total_answers: 0, correctAnswers: 0 };
        }
    }

    const fetchApiUsageData = useCallback(async () => {
        if (useAccountAddress) {
            const data = await fetchApiUsage(useAccountAddress);
            setAllowedTokens(data.allowed_tokens);
            setUsedTokens(data.used_tokens);
            setCorrectAnswers(data.correct_answers || 0);
            setTotalAnswers(data.total_answers || 0);
            setReferredBy(data.refered_by || "");
            setUserApiKey(data.api_key)
        }
    }, [useAccountAddress]);

    // Fetch referral data
    const handleReferralData = async () => {
        setLoadingReferData(true); // Set loading state to true
        try {
            const response = await fetch(`https://main-wjaxre4ena-uc.a.run.app/api_usage?address=${useAccountAddress}`);
            if (!response.ok) {
                throw new Error("Error fetching referral data");
            }
            const data = await response.json();
            setReferredCreditScores(data.referred_credit_scores || {});
            setReferredIds(data.referred_ids || {});
            setReferredBonuses(data.referred_bonus || {});
            setIsReferralModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch referral data:", error);
        } finally {
            setLoadingReferData(false); // Reset loading state
        }
    };
    
    class Presale {
        constructor(presaleData) {
            this.preSaleDataLocal = presaleData;
            if (this.preSaleDataLocal) {
                const presaleSplit = presaleData.toString().split(',');
                let counter = 0;
                this.saleToken = presaleSplit[counter++];
                this.startTime = new Date(presaleSplit[counter++] * 1000);
                this.endTime = new Date(presaleSplit[counter++] * 1000);
                this.price = (presaleSplit[counter++] / (10 ** 30));
                this.tokensToSell = presaleSplit[counter++];
                this.tokensToSellParsed = new Intl.NumberFormat().format(this.tokensToSell);
                this.presaleGoal = this.tokensToSell * this.price;
                this.preSaleGoalParsed = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(this.presaleGoal);
                this.baseDecimals = presaleSplit[counter++];
                this.inSale = presaleSplit[counter++];
                this.tokensSold = this.tokensToSell - this.inSale;
                this.presaleFundsRaised = this.tokensSold * this.price;
                this.presaleFundsRaisedParsed = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(this.presaleFundsRaised);
                this.tokensSoldParsed = new Intl.NumberFormat().format(this.tokensSold);
                this.vestingStartTime = new Date(presaleSplit[counter++] * 1000);
                this.vestingCliff = presaleSplit[counter++];
                this.vestingPeriod = presaleSplit[counter++];
                this.enableBuyWithEth = Boolean(parseInt(presaleSplit[counter++]));
                this.enableBuyWithUsdt = Boolean(parseInt(presaleSplit[counter++]));
                this.salePercentage = this.tokensSold * 100 / this.tokensToSell;
                this.salePercentageParsed = this.salePercentage.toFixed(2) + "%";
            }
        }

        get HtmlOutput() {
            if (this.preSaleDataLocal) {
                return (
                    <>
                        <p>Sale Token: {this.saleToken}</p>
                        <p>startTime: {this.startTime.toLocaleString("default")}</p>
                        <p>endTime: {this.endTime.toLocaleString("default")}</p>
                        <p>price: {this.price.toFixed(3)}$ per Token</p>
                        <p>tokensToSell: {new Intl.NumberFormat().format(this.tokensToSell)} Token</p>
                        <p>inSale: {new Intl.NumberFormat().format(this.inSale)} Token</p>
                        <p>tokensSold: {new Intl.NumberFormat().format(this.tokensSold)} Token</p>
                        <p>presaleGoal: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(this.presaleGoal)} $</p>
                        <p>baseDecimals: {this.baseDecimals}</p>
                        <p>vestingStartTime: {this.vestingStartTime.toLocaleString("default")}</p>
                        <p>vestingCliff: {this.vestingCliff}</p>
                        <p>vestingPeriod: {this.vestingPeriod}</p>
                        <p>enableBuyWithEth: {this.enableBuyWithEth.toString()}</p>
                        <p>enableBuyWithUsdt: {this.enableBuyWithUsdt.toString()}</p>
                    </>
                );
            } else {
                return (<></>);
            }
        }
    }

    const printPresaleData = (presaleData) => {
        const preSale = new Presale(presaleData);
        setPresaleDataParsed(preSale);
    };
    const handleGairdrop = async () => {
        setLoadingAirdrop(true);
        setAirdropResult(null); // Clear previous result
        setAirdropError(null);  // Clear previous error
        setShowAirdropMessage(false); // Clear previous message visibility
        try {
            const response = await fetch('https://main-wjaxre4ena-uc.a.run.app/gairdrop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ to_address: useAccountAddress }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                setAirdropError(data.error || 'Error with G airdrop');
                setShowAirdropMessage(true);
                throw new Error(data.error || 'Error with G airdrop');
            }
    
            setAirdropResult(data);
            setShowAirdropMessage(true);
        } catch (error) {
            console.error('Error with G airdrop:', error);
        } finally {
            setLoadingAirdrop(false);
        }
    };

    // ... [Other necessary functions such as fetchApiUsage function] ...

    const payload = { 
        "chains": [
            {
                "presale_id": 1,
                "rpc_endpoint": "https://bsc-mainnet.nodereal.io/v1/9e1db4557198415aa3b2f017b9e8e403",
                "contract_address": "0x83a823a40cC652a8d841e6561fe223aE700299ae",
                "chain_id": 56
            },
            {
                "presale_id": 1,
                "rpc_endpoint": "https://opbnb-mainnet.nodereal.io/v1/9e1db4557198415aa3b2f017b9e8e403",
                "contract_address": "0x879cD4f2558cF27cb8FC5492241DD14B952957Be",
                "chain_id": 204
            }
        ]
    };
    async function fetchPresaleData() {
        try {
            const response = await fetch('https://main-wjaxre4ena-uc.a.run.app/get_presale_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
    
            if (!response.ok) {
                throw new Error("Error fetching presale data");
            }
    
            const data = await response.json();
    
            // Assuming the data structure is as provided in the response
            setPresaleDataMultiChain(data);
    
        } catch (error) {
            console.error("Failed to fetch presale data:", error);
        }
    }

    useEffect(() => {
        fetchPresaleData();
    }, []);
    
    const chainIdToNameMap = {
        56: "BSC",
        204: "opBNB",
        // Add more chain IDs and names if needed
    };
    
    const renderDisplayPresaleData = () => {
        if (useAccountAddress || !presaleDataMultiChain || presaleDataMultiChain.length === 0) return null;
    
        return presaleDataMultiChain.map((dataItem, index) => {
            const { chain, presale_data } = dataItem;
            const salePercentage = (presale_data.inSale / presale_data.tokensToSell) * 100;
    
            const tokensSold = presale_data.tokensToSell - presale_data.inSale;
            const priceInHumanReadableForm = presale_data.price / (10 ** 30);
            const raisedAmount = tokensSold * priceInHumanReadableForm;
            const presaleGoal = presale_data.tokensToSell * priceInHumanReadableForm;
    
            // Format to human-friendly numbers
            const formattedRaisedAmount = raisedAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
            const formattedPresaleGoal = presaleGoal.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    
            // Get the chain name from the mapping or fallback to the chain ID if not found
            const chainName = chainIdToNameMap[chain.chain_id] || `Chain ID: ${chain.chain_id}`;
    
            return (
                <div key={index} className="mb-6">
                    <h2 className="text-white text-xs mb-2">{chainName}</h2>
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mb-3">
                        <div className="bg-red-600 text-xs font-small font-bold text-neutral-900 text-center p-0.5 leading-none rounded-full"
                            style={{ width: `${salePercentage}%` }}>
                            {`${salePercentage.toFixed(2)}%`}
                        </div>
                    </div>
                    <p className="text-white text-xs">
                        Raised — {formattedRaisedAmount}
                        /
                        {formattedPresaleGoal}
                    </p>
                </div>
            );
        });
    };

    useEffect(() => {
        if (chain) {
            if (chain.id === 56) { // BNB
                setContractAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
                setAbi(process.env.NEXT_PUBLIC_CONTRACT_ABI);
                setPresaleId(process.env.NEXT_PUBLIC_PRESALE_ID);
            } else if (chain.id === 204) { // OPBNB
                setContractAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPBNB);
                setAbi(process.env.NEXT_PUBLIC_CONTRACT_ABI);
                setPresaleId(process.env.NEXT_PUBLIC_PRESALE_ID_OPBNB);
            } else {
                console.error('Unsupported network');
            }
        }
    }, [chain]);

    const { data: presaleData,
        error: presaleDataError,
        isError: presaleIsError,
        isLoading: presaleIsLoading,
        status: presaleStatus,
        refetch: refetchPresaleData,
    } = useContractRead({
        address: contractAddress,
        abi: JSON.parse(abi),
        functionName: "presale",
        args: [presaleId],
        watch: false,
    });

    useEffect(() => {
        Log("----------> presaleData: " + presaleData);
        Log("----------> presaleDataError: " + presaleDataError);
        Log("----------> presaleIsError: " + presaleIsError);
        Log("----------> presaleIsLoading: " + presaleIsLoading);
        Log("----------> presaleStatus: " + presaleStatus);
        if (presaleData) {
            printPresaleData(presaleData);
        }
    }, [presaleData, presaleDataError, presaleIsError, presaleIsLoading, presaleStatus]);

    const { data: userVestingData,
        error: userVestingError,
        isError: userVestingIsError,
        isLoading: userVestingIsLoading,
        status: userVestingStatus,
        refetch: refetchUserVestingData,
    } = useContractRead({
        address: contractAddress,
        abi: JSON.parse(abi),
        functionName: "userVesting",
        args: [useAccountAddress, presaleId],
        watch: true,
    });

    const [displayPresaleData, setDisplayPresaleData] = useState(null);
    const [displayBuyData, setBuyData] = useState(null);
    const [displayUserVestingData, setDisplayUserVestingData] = useState(null);

    useEffect(() => {
        if (!presaleDataParsed) return;

        if (!useAccountAddress) {
            setDisplayPresaleData(
                <>
                    <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mb-3">
                        <div className="bg-red-600 text-xs font-medium font-bold text-neutral-900 text-center p-0.5 leading-none rounded-full"
                            style={{ width: presaleDataParsed?.salePercentageParsed }}>
                            {presaleDataParsed?.salePercentageParsed}
                        </div>
                    </div>
                    <p className="text-white">
                        Sold — {presaleDataParsed?.tokensSoldParsed}
                        /
                        {presaleDataParsed?.tokensToSellParsed}
                    </p>
                    <p className="text-white mb-6">
                        Sold — {presaleDataParsed?.presaleFundsRaisedParsed}
                        /
                        {presaleDataParsed?.preSaleGoalParsed}
                    </p>
                </>
            );
            setBuyData(null);
            setDisplayUserVestingData(null);
        } else {
            setDisplayPresaleData(null);
            setDisplayUserVestingData(<UserVesting userVestingData={userVestingData} userAddress={useAccountAddress} telegramCode={userTelegramCode} apiKey={userApiKey} />);
            setBuyData(
                <>
                    <div className="flex items-center justify-center mb-6 mt-5">
                        <BuyWithUsdtModal slug={slug} />
                    </div>
                </>
            );
        }
    }, [useAccountAddress, presaleDataParsed, userVestingData, userTelegramCode, userApiKey, slug]);

    useEffect(() => {
        const fetchData = async () => {
            await fetchApiUsageData();
            refetchPresaleData();
            refetchUserVestingData();
        };

        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 10000); // Fetch data every 10 seconds

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, [fetchApiUsageData, refetchPresaleData, refetchUserVestingData]);

    return (
        <div className="text-center">
            <div className="box-cont h-fit w-fit px-14 mb-10 py-8 shadow-md bg-neutral-900 rounded-lg">
                <div className="flex flex-col items-center space-y-4">
                    {/* First button group */}
                    <div className="flex justify-center space-x-4 mb-0">
                        <button onClick={() => setIsCreditCardModalOpen(true)} className="mt-4 button-class bg-blue-500 text-white px-4 py-2 rounded">
                            Witch Card
                        </button>
                        <button onClick={handleGairdrop} className="mt-4 button-class bg-green-500 text-white px-4 py-2 rounded" disabled={loadingAirdrop}>
                            {loadingAirdrop ? 'Loading...' : 'G airdrop'}
                        </button>
                    </div>

                    {/* Second button group */}
                    <div className="flex justify-center space-x-4 mb-0">
                        <button onClick={handleReferralData} className="button-class bg-green-500 text-white px-4 py-2 rounded" disabled={loadingReferData}>
                            {loadingReferData ? 'Loading...' : 'Referral'}
                        </button>
                        <button onClick={handleOpenKombatModal} className="button-class bg-orange-500 text-white px-4 py-2 rounded">
                            Kombat
                        </button>
                        <button onClick={handleOpenStatsModal} className="button-class bg-blue-500 text-white px-4 py-2 rounded">
                            Stats
                        </button>
                    </div>

                    {/* Resume block */}
                    <div onClick={handleOpenResumeModal} className="cursor-pointer flex items-center justify-center w-[200px] h-[76px] relative mb-10 ml-4">
                        <div className="w-[200px] h-[76px] left-0 top-0 absolute bg-[#abd72e] rounded-[22.5px]"></div>
                        <img className="w-[57px] h-[60px] left-[8px] top-[8px] absolute rounded-[13.5px]" src="https://storage.googleapis.com/cryptitalk/little_witch.png" />
                        <div className="left-[80px] top-[20px] absolute text-black text-small font-large font-irish-grover">Your Resume</div>
                    </div>
                </div>
                
                {isReferralModalOpen && <ReferralModal referredCreditScores={referredCreditScores} referredBonuses={referredBonuses} idmap={referredIds} toAddress={useAccountAddress} onClose={() => setIsReferralModalOpen(false)} />}
    
                <ResumeModal
                    isOpen={isResumeModalOpen}
                    onClose={handleCloseResumeModal}
                    usedTokens={usedTokens}
                    allowedTokens={allowedTokens}
                    correctAnswers={correctAnswers}
                    totalAnswers={totalAnswers}
                    referredBy={referredBy}
                    evmAddress={useAccountAddress}
                />
                {showAirdropMessage && airdropError && (
                    <div className="my-4 text-sm bg-red-500 text-white p-2 rounded relative">
                        Error: {airdropError} <br />
                        Airdrop rules: <a href={`https://doc.context-pilot.xyz/the-witch-card/g-airdrop`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-200">
                            doc link
                        </a>
                        <button
                            onClick={() => setShowAirdropMessage(false)}
                            className="absolute top-0 right-0 mt-2 mr-2 bg-white text-black text-sm px-2 rounded"
                        >
                            x
                        </button>
                    </div>
                )}
                {showAirdropMessage && airdropResult && (
                    <div className="my-4 text-sm bg-green-500 text-white p-2 rounded relative">
                        Airdrop successful!<br />
                        Transaction Hash: <a href={`${airdropResult.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-200">
                            transaction link
                        </a> <br />
                        Airdrop rules: <a href={`https://doc.context-pilot.xyz/the-witch-card/g-airdrop`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-200">
                            doc link
                        </a>
                        <button
                            onClick={() => setShowAirdropMessage(false)}
                            className="absolute top-0 right-0 mt-2 mr-2 bg-white text-black text-sm px-2 rounded"
                        >
                            x
                        </button>
                    </div>
                )}
    
                {/* Add margin to the presale data section */}
                <div className="mb-4">
                    {renderDisplayPresaleData()}
                </div>
                
                <div className="flex place-items-center justify-around mb-4">
                    {displayUserVestingData}
                </div>
                
                {displayBuyData && (
                    <div className="flex place-items-center justify-around mb-4">
                        {displayBuyData}
                    </div>
                )}
    
                <div className="flex place-items-center justify-around">
                    <ConnectButton />
                </div>
            </div>
    
            {isCreditCardModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-black opacity-50 absolute inset-0"></div>
                    <div className="relative z-10">
                        <CreditCardModal evmAddress={useAccountAddress} />
                        <button onClick={() => setIsCreditCardModalOpen(false)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
                            Close
                        </button>
                    </div>
                </div>
            )}
    
            {isKombatModalOpen && (
                <KombatModal
                    isOpen={isKombatModalOpen}
                    onClose={handleCloseKombatModal}
                    telegram_code={userTelegramCode}
                />
            )}
    
            <StatsModal isOpen={isStatsModalOpen} onClose={handleCloseStatsModal} />
    
            <style jsx>{`
            @media (max-width: 640px) {
                .button-class {
                    font-size: 12px;
                }
            }
            .button-class {
                font-size: 14px; // Ensure consistency, change as needed
            }
            `}</style>
        </div>
    );
}