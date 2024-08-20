import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import BuyWithUsdtModal from './buyWithUsdtModal';
import CreditCardModal from './CreditCardModal';

function UserVesting({ userVestingData, userAddress }) {
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
            <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" version="1.0" width="240.000000pt" height="240.000000pt" viewBox="0 0 240.000000 240.000000" preserveAspectRatio="xMidYMid meet">
                <g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)" fill="#FFFFFF" stroke="none">
                    <path d="M320 1225 l0 -895 95 0 95 0 0 -117 0 -118 118 118 117 117 683 0 682 0 0 895 0 895 -895 0 -895 0 0 -895z m1195 476 c134 -13 227 -72 280 -177 27 -52 30 -69 30 -149 0 -75 -4 -98 -24 -140 -32 -63 -93 -124 -156 -156 -48 -23 -60 -24 -274 -27 l-224 -3 -169 -165 -169 -164 -106 0 c-80 0 -104 3 -101 13 3 6 81 229 174 494 l169 483 245 -1 c135 0 281 -4 325 -8z" />
                    <path d="M1047 1551 c-3 -9 -48 -137 -101 -286 -53 -148 -96 -277 -96 -285 0 -8 46 31 103 87 58 58 118 109 140 118 30 12 78 15 247 15 235 -1 259 4 307 67 20 26 28 50 31 93 5 72 -16 121 -70 161 -48 34 -76 37 -350 42 -180 3 -207 1 -211 -12z" />
                </g>
            </svg>
            <div className="pl-4 text-sm font-normal">
                You own {new Intl.NumberFormat().format(totalAmount)} Credits<br />
                Secret key: {showKey ? secretKeyPart : "****"}
                <button onClick={toggleKeyVisibility} className="pl-2 text-blue-500">{showKey ? "Hide" : "Show"}</button>
            </div>
        </div>
    );
}

export default function SeedSale() {
    const { address: useAccountAddress, isConnected: useAccountIsConnected } = useAccount();
    const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);
    const [allowedTokens, setAllowedTokens] = useState(0);
    const [usedTokens, setUsedTokens] = useState(0);
    const [presaleDataParsed, setPresaleDataParsed] = useState(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalAnswers, setTotalAnswers] = useState(0);
    const [points, setPoints] = useState(0);
    const { chain } = useAccount();
    const [contractAddress, setContractAddress] = useState(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
    const [abi, setAbi] = useState(process.env.NEXT_PUBLIC_CONTRACT_ABI);
    const [presaleId, setPresaleId] = useState(process.env.NEXT_PUBLIC_PRESALE_ID);

    const onSuccessfulPurchase = () => {
        console.log('Purchase was successful!');
        setBuyWithCreditCardModalOpen(false);
    };

    function Log(stringToLog) {
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        console.log(today.toUTCString() + " | " + stringToLog);
    }

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
            setPoints(data.correct_answers * 100 || 0);
        }
    }, [useAccountAddress]);

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
            setDisplayUserVestingData(<UserVesting userVestingData={userVestingData} userAddress={useAccountAddress} />);
            setBuyData(
                <>
                    <div className="flex items-center justify-center mb-6 mt-5">
                        <svg className="animate-bounce w-16 h-16" xmlns="http://www.w3.org/2000/svg" version="1.0" width="240.000000pt" height="240.000000pt" viewBox="0 0 240.000000 240.000000" preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)" fill="#FFFFFF" stroke="none">
                                <path d="M320 1225 l0 -895 95 0 95 0 0 -117 0 -118 118 118 117 117 683 0 682 0 0 895 0 895 -895 0 -895 0 0 -895z m1195 476 c134 -13 227 -72 280 -177 27 -52 30 -69 30 -149 0 -75 -4 -98 -24 -140 -32 -63 -93 -124 -156 -156 -48 -23 -60 -24 -274 -27 l-224 -3 -169 -165 -169 -164 -106 0 c-80 0 -104 3 -101 13 3 6 81 229 174 494 l169 483 245 -1 c135 0 281 -4 325 -8z" />
                                <path d="M1047 1551 c-3 -9 -48 -137 -101 -286 -53 -148 -96 -277 -96 -285 0 -8 46 31 103 87 58 58 118 109 140 118 30 12 78 15 247 15 235 -1 259 4 307 67 20 26 28 50 31 93 5 72 -16 121 -70 161 -48 34 -76 37 -350 42 -180 3 -207 1 -211 -12z" />
                            </g>
                        </svg>
                    </div>
                    <div className="flex items-center justify-center mb-6 mt-5">
                        <BuyWithUsdtModal />
                    </div>
                </>
            );
        }
    }, [useAccountAddress, presaleDataParsed, userVestingData]);

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
                {/* Replace the existing header with the "Witch Card" button */}
                <button
                    onClick={() => setIsCreditCardModalOpen(true)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Witch Card
                </button>
    
                {/* Smaller font size for this section */}
                <div className="my-4 text-sm">
                    <p className="text-white">
                        Used / Allowed Tokens: <br /> {usedTokens} / {allowedTokens}
                    </p>
                    <p className="text-white">
                        Correct / Total Answers: <br /> {correctAnswers} / {totalAnswers}
                    </p>
                    <p className="text-white">
                        Points earned: {points}
                    </p>
                </div>
                {displayPresaleData}
                <div className="flex place-items-center justify-around">
                    {displayUserVestingData}
                </div>
                {displayBuyData}
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
        </div>
    );
}