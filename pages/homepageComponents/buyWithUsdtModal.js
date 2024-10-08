import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
faDollar
} from "@fortawesome/free-solid-svg-icons";
import {
useAccount,
useContractRead,
useWriteContract,
useWaitForTransactionReceipt,
} from "wagmi";
import axios from "axios";

const BuyWithUsdtModal = ( { slug } ) => {
  const { address: useAccountAddress, connector: useAccountActiveConnector, isConnected: useAccountIsConnected } = useAccount()

  /**
   * @fn Log
   * @brief Log to console
   */
  function Log(stringToLog) {
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    console.log(today.toUTCString() + " | " + stringToLog);
  }

  /**
   * @class Presale
   * @brief Presale Data
   */
  class Presale {
    constructor(presaleData) {
      this.preSaleDataLocal = presaleData;
      if (this.preSaleDataLocal) {
        var presaleSplit = presaleData.toString().split(",");
        var counter = 0;
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
        )
      }
      else return (<></>);
    }
  }

  /*!
  * @fn printPresaleData
  * @brief Print Presale Data
  */
  function printPresaleData(presaleData) {
    var preSale = new Presale(presaleData);
    setPresaleDataParsed(preSale);
  }

  /* Constants */
  const [tokens = 1, setTokens] = useState();
  const [usdt, setUsdt] = useState(0);
  const [usdtInputBoxClassName, setUsdtInputBoxClassName] = useState();
  const [usdtInputBoxError, setUsdtInputBoxError] = useState();
  const [convertToUsdtButtonClass, setConvertToUsdtButtonClass] = useState();
  const [convertToUsdtDisabled, setConvertToUsdtDisabled] = useState();
  const [convertToUsdtInProcessText, setConvertToUsdtInProcessText] = useState();
  const [refetchCount, setRefetchCount] = useState(0);
  const { chain } = useAccount();
  const [stableCoinAbi, setStableCoinAbi] = useState(process.env.NEXT_PUBLIC_STABLE_COIN_CONTRACT_ABI);
  const [chainId, setChainId] = useState(process.env.NEXT_PUBLIC_CHAIN_ID);
  const [contractAddress, setContractAddress] = useState(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  const [abi, setAbi] = useState(process.env.NEXT_PUBLIC_CONTRACT_ABI);
  const [presaleId, setPresaleId] = useState(process.env.NEXT_PUBLIC_PRESALE_ID);

  // Dynamically set the contract address based on the current chain
  useEffect(() => {
    if (chain) {
      if (chain.id === 56) { // BNB
        setContractAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
        setAbi(process.env.NEXT_PUBLIC_CONTRACT_ABI);
        setChainId(process.env.NEXT_PUBLIC_CHAIN_ID);
        setPresaleId(process.env.NEXT_PUBLIC_PRESALE_ID);
        setStableCoinAbi(process.env.NEXT_PUBLIC_STABLE_COIN_CONTRACT_ABI);
      } else if (chain.id === 204) { // OPBNB
        setContractAddress(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_OPBNB);
        setAbi(process.env.NEXT_PUBLIC_CONTRACT_ABI);
        setChainId(process.env.NEXT_PUBLIC_CHAIN_ID_OPBNB);
        setPresaleId(process.env.NEXT_PUBLIC_PRESALE_ID_OPBNB);
        setStableCoinAbi(process.env.NEXT_PUBLIC_STABLE_COIN_CONTRACT_ABI);
      } else {
        console.error('Unsupported network');
      }
    }
  }, [chain]);

  /* Presale Data */
  const [presaleDataParsed, setPresaleDataParsed] = useState(0);
  const { data: presaleData,
    refetch: refetchPresaleData,
    error: presaleDataError,
    isError: presaleIsError,
    isLoading: presaleIsLoading,
    status: presaleStatus } = useContractRead({
      address: contractAddress,
      abi: JSON.parse(abi),
      functionName: "presale",
      args: [presaleId],
      watch: true,
    });

  /* --------- */

  /* USDT Interface Contract Address */
  const { data: usdtContractAddress } = useContractRead({
    address: contractAddress,
    abi: JSON.parse(abi),
    functionName: "USDTInterface",
    watch: true,
  });

  /* USDT Buy Helper */
  const { data: usdtAllowanceHelper,
    refetch: refetchUsdtAllowanceHelper
  } = useContractRead({
    address: contractAddress,
    abi: JSON.parse(abi),
    functionName: "usdtBuyHelper",
    args: [presaleId, tokens],
    watch: true,
  });
  /* USDT Allowance */
  const [accountAllowancePublic, setAccountAllowance] = useState();
  const {
    data: accountAllowance,
    refetch: refetchAccountAllowanceHelper,
    error: accountAllowanceError,
    isError: accountAllowanceIsError,
    isLoading: accountAllowanceIsLoading } = useContractRead({
      address: usdtContractAddress,
      abi: JSON.parse(stableCoinAbi),
      functionName: "allowance",
      args: [useAccountAddress, contractAddress],
      watch: true,
    });
  useEffect(() => {
    if (accountAllowance)
      setAccountAllowance(accountAllowance.toString());
  }, [accountAllowance]);
  /* USDT BalanceOf */
  const [usdtBalanceOfWalletConnected, setUsdtBalanceOfWalletConnected] = useState();
  const {
    data: usdtBalanceOfWalletData,
    refetch: refetchUsdtBalanceOfWalletData } = useContractRead({
      address: usdtContractAddress,
      abi: JSON.parse(stableCoinAbi),
      functionName: "balanceOf",
      args: [useAccountAddress],
      watch: true,
    });
  useEffect(() => {
    if (usdtBalanceOfWalletData != undefined) {
      var usdtBalanceParsed = Number(usdtBalanceOfWalletData) / (10 ** 18);
      Log("----> usdtBalanceParsed: " + usdtBalanceParsed);
      setUsdtBalanceOfWalletConnected(usdtBalanceParsed);

    }
  }, [usdtBalanceOfWalletData]);

  const { writeContract, data: writeData, status: writeStatus, error: writeError } = useWriteContract()
  const [writeType, setWriteType] = useState(0);
  const [usdtAllowanceIsLoading, setUsdtAllowanceIsLoading] = useState(0);
  const [isBuyWithUsdtLoading, setIsBuyWithUsdtLoading] = useState(0);
  const [usdtAllowanceData, setUsdtAllowanceData] = useState(0);
  const [buyWithUsdtData, setBuyWithUsdtData] = useState(0);
  useEffect(() => {
    console.log("writeType", writeType)
    console.log("writeData", writeData)
    console.log("writeStatus", writeStatus)
    console.log("writeError", writeError)
    if (writeType == "approve") {
      if (writeStatus == "pending") {
        setUsdtAllowanceIsLoading(true)
      } else if (writeStatus == "success") {
        setUsdtAllowanceIsLoading(false)
        setUsdtAllowanceData(writeData)
      } else {
        setUsdtAllowanceIsLoading(false)
      }
    } else if (writeType == "buy") {
      if (writeStatus == "pending") {
        setIsBuyWithUsdtLoading(true)
      } else if (writeStatus == "success") {
        setIsBuyWithUsdtLoading(false)
        setBuyWithUsdtData(writeData)
      } else {
        setIsBuyWithUsdtLoading(false)
      }
    }

  }, [writeData, writeStatus, writeError]);


  const {
    isLoading: waitForTransactionUsdtAllowanceIsLoading,
    isSuccess: waitForTransactionUsdtAllowanceIsSuccess,
    isError: waitForTransactionUsdtAllowanceIsError,
    error: waitForTransactionUsdtAllowanceError,
  } = useWaitForTransactionReceipt({
    hash: usdtAllowanceData,
  });

  const {
    isLoading: waitForTransactionIsLoading,
    isSuccess: waitForTransactionIsSuccess
  } = useWaitForTransactionReceipt({
    hash: buyWithUsdtData,
  });

  function setTokensFromUsdt(usdtSet) {
    Log("Buy with USDT - Tokens: " + tokens + " - UsdtValue: " + usdtSet);
    if (!presaleData)
      return;
    var presale = new Presale(presaleData);
    var tokens = usdtSet / presale.price;
    setTokens(tokens);
  }

  useEffect(() => {
    if (waitForTransactionUsdtAllowanceIsSuccess) {
      setRefetchCount(prev => prev + 1);
    }
  }, [waitForTransactionUsdtAllowanceIsSuccess,
    waitForTransactionUsdtAllowanceIsError,
    waitForTransactionUsdtAllowanceError]);

  useEffect(() => {
    if (refetchCount > 0) {
      console.log("refetch information", accountAllowancePublic, usdtAllowanceHelper)
      setAccountAllowance(0)
      refetchPresaleData();
      refetchUsdtAllowanceHelper();
      refetchAccountAllowanceHelper();
      refetchUsdtBalanceOfWalletData();
    }
  }, [refetchCount, refetchPresaleData, refetchAccountAllowanceHelper, refetchUsdtAllowanceHelper, refetchUsdtBalanceOfWalletData]);

  useEffect(() => {
    if (!presaleData)
      return;
    var presale = new Presale(presaleData);
    var usdtValue = tokens * presale.price;
    Log("Buy with USDT - Tokens: " + tokens + " - UsdtValue: " + usdtValue + " - usdtBalanceOfWalletConnected: " + usdtBalanceOfWalletConnected);
    setUsdt(usdtValue);
    if (usdtValue <= usdtBalanceOfWalletConnected) {
      setUsdtInputBoxClassName("rounded-none rounded-l-lg border bg-gray-300 border border-gray-300 text-gray-900 block cursor-not-allowed flex-1 min-w-0 w-full text-sm p-2.5 placeholder-gray-400 focus:ring-red-500");
      setUsdtInputBoxError("");
      setConvertToUsdtButtonClass("bg-red-600 text-white md:hover:text-white md:hover:bg-slate-300 active:bg-red-900 font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md md:hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150");
      setConvertToUsdtDisabled(false);
    }
    else {
      setUsdtInputBoxClassName("rounded-none rounded-l-lg border bg-red-50 border border-red-500 text-red-900 block cursor-not-allowed flex-1 min-w-0 w-full text-sm p-2.5 placeholder-gray-400 focus:ring-red-500");
      setUsdtInputBoxError(
        <>
          <div className="flex">
            <p class="mt-2 text-sm text-red-600"><span class="font-medium">Oh, snapp!</span> Insufficient USDT Balance.<br />
              Current balance: <span class="font-medium">{usdtBalanceOfWalletConnected}</span> USDT</p>
          </div>
        </>
      );
      setConvertToUsdtButtonClass("cursor-not-allowed bg-gray-300 text-neutral-900 text-white font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md md:hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150");
      setConvertToUsdtDisabled(true);
    }
  }, [tokens, presaleData, usdtBalanceOfWalletConnected]);
  useEffect(() => {
    if (waitForTransactionIsLoading || usdtAllowanceIsLoading || isBuyWithUsdtLoading || waitForTransactionUsdtAllowanceIsLoading) {
      setConvertToUsdtDisabled(true);
      setConvertToUsdtButtonClass("cursor-not-allowed bg-gray-300 text-neutral-900 text-white font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md md:hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150");
    }
    else {
      setConvertToUsdtDisabled(false);
      setConvertToUsdtButtonClass("bg-red-600 text-white md:hover:text-white md:hover:bg-slate-300 active:bg-red-900 font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md md:hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150");
    }

    if (usdtAllowanceIsLoading || waitForTransactionUsdtAllowanceIsLoading) {
      Log("##### waitForTransactionIsLoading -> " + waitForTransactionIsLoading);
      setConvertToUsdtInProcessText(
        <>
          <div className="flex items-center justify-center mb-5">
            <div role="status">
              <svg class="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2 text-sm text-green-200"> Please wait, granting allowance of <span class="font-medium">USDT</span>...</p>
          </div>
        </>);
    }
    else if (isBuyWithUsdtLoading || waitForTransactionIsLoading) {
      Log("##### usdtAllowanceIsLoading -> " + usdtAllowanceIsLoading);
      setConvertToUsdtInProcessText(
        <>
          <div className="flex items-center justify-center mb-5">
            <div role="status">
              <svg class="inline mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
            <p class="mt-2 text-sm text-green-200"> Please wait, <span class="font-medium">investment</span> in progress...</p>
          </div>
        </>);
    }
    else if (waitForTransactionIsSuccess) {
      Log("##### usdtAllowanceIsLoading -> " + usdtAllowanceIsLoading);
      setRefetchCount(prev => prev + 1);
      setConvertToUsdtInProcessText(
        <>
          <div className="flex items-center justify-center mb-5">
            <p class="mt-2 text-sm text-green-200"><span class="font-medium">Congratulations!</span> You're investment was successful. <br />
              <span class="font-medium">Welcome on board!</span></p>
          </div>
        </>);
    }
    else {
      Log("##### setConvertToUsdtInProcessText Empty");
      setConvertToUsdtInProcessText("");
    }
  }, [waitForTransactionIsLoading,
    usdtAllowanceIsLoading,
    isBuyWithUsdtLoading,
    waitForTransactionUsdtAllowanceIsLoading,
    waitForTransactionIsSuccess]);

  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        className="bg-red-600 text-white hover:text-white hover:bg-slate-300 active:bg-red-900 font-bold uppercase text-base px-8 py-3 rounded-[24px] shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        type="button"
        onClick={() => setShowModal(true)}
      >
        BUY WITH USDT <FontAwesomeIcon icon={faDollar} className="ml-2" />
      </button>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-neutral-900 outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                  <h3 className="text-white text-3xl font=semibold uppercase">
                    Exchange
                  </h3>
                  <button
                    className="bg-transparent border-0 text-white float-right"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="text-white hover:text-white hover:bg-slate-300 active:bg-red-900 text-white opacity-7 h-6 w-6 text-xl block bg-neutral-700 py-0 rounded-full">
                      X
                    </span>
                  </button>
                </div>
                <div className="relative p-6 flex-auto">
                  <form className="bg-neutral-800 shadow-md rounded px-8 pt-6 pb-8 w-full">
                    <div className="flex">
                      <input type="number" value={tokens} onChange={(e) => setTokens(e.target.value)} className="rounded-none rounded-l-lg bg-gray-50 border text-gray-900 focus:border-red-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 focus:ring-red-500" />
                      <span className="inline-flex items-center px-3 text-sm w-50 text-gray-900 bg-gray-200 rounded-r-md border border-r-0 border-gray-300">
                        <svg className="hover:animate-ping w-8 h-8 absolute inline-flex h-full w-full rounded-full opacity-75" xmlns="http://www.w3.org/2000/svg" version="1.0" width="240.000000pt" height="240.000000pt" viewBox="0 0 240.000000 240.000000" preserveAspectRatio="xMidYMid meet">
                          <g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                            <path d="M320 1225 l0 -895 95 0 95 0 0 -112 0 -113 113 113 112 112 688 0 687 0 0 895 0 895 -895 0 -895 0 0 -895z m1195 476 c134 -13 227 -72 280 -177 27 -52 30 -69 30 -149 0 -75 -4 -98 -24 -140 -32 -63 -93 -124 -156 -156 -48 -23 -60 -24 -274 -27 l-224 -3 -169 -165 -169 -164 -106 0 c-80 0 -104 3 -101 13 3 6 81 229 174 494 l169 483 245 -1 c135 0 281 -4 325 -8z" />
                            <path d="M1047 1551 c-3 -9 -48 -137 -101 -286 -53 -148 -96 -277 -96 -285 0 -8 46 31 103 87 58 58 118 109 140 118 30 12 78 15 247 15 235 -1 259 4 307 67 20 26 28 50 31 93 5 72 -16 121 -70 161 -48 34 -76 37 -350 42 -180 3 -207 1 -211 -12z" />
                          </g>
                        </svg>
                        <svg className="relative inline-flex rounded-full h-8 w-8" xmlns="http://www.w3.org/2000/svg" version="1.0" width="240.000000pt" height="240.000000pt" viewBox="0 0 240.000000 240.000000" preserveAspectRatio="xMidYMid meet">
                          <g transform="translate(0.000000,240.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                            <path d="M320 1225 l0 -895 95 0 95 0 0 -112 0 -113 113 113 112 112 688 0 687 0 0 895 0 895 -895 0 -895 0 0 -895z m1195 476 c134 -13 227 -72 280 -177 27 -52 30 -69 30 -149 0 -75 -4 -98 -24 -140 -32 -63 -93 -124 -156 -156 -48 -23 -60 -24 -274 -27 l-224 -3 -169 -165 -169 -164 -106 0 c-80 0 -104 3 -101 13 3 6 81 229 174 494 l169 483 245 -1 c135 0 281 -4 325 -8z" />
                            <path d="M1047 1551 c-3 -9 -48 -137 -101 -286 -53 -148 -96 -277 -96 -285 0 -8 46 31 103 87 58 58 118 109 140 118 30 12 78 15 247 15 235 -1 259 4 307 67 20 26 28 50 31 93 5 72 -16 121 -70 161 -48 34 -76 37 -350 42 -180 3 -207 1 -211 -12z" />
                          </g>
                        </svg>
                        TOKEN
                      </span>
                    </div>
                    <div className="flex">
                      <input type="number" value={usdt.toFixed(6)} disabled readOnly
                        className={`${usdtInputBoxClassName}`}
                      />
                      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 rounded-r-md border border-r-0 border-gray-300">
                        <svg className="hover:animate-ping w-9 h-9 absolute inline-flex h-full w-full rounded-full opacity-75" xmlns="http://www.w3.org/2000/svg" width="2000" height="1750" viewBox="0 0 2000 1750"><path fill="#53ae94" d="M1632.3 0 367.7 0 0 785.98 1000 1750 2000 785.98 1632.3 0z" /><path d="M1138.88,626.12V473.58H1487.7V241.17H537.87V473.58H886.72V626C603.2,639,390,695.17,390,762.43S603.3,885.85,886.72,899v488.59H1139V898.91c283-13.06,495.75-69.17,495.75-136.38S1422,639.22,1139,626.16m0,231.37v-.13c-7.11.45-43.68,2.65-125.09,2.65-65.09,0-110.89-1.85-127-2.69v.21C636.36,846.47,449.4,802.85,449.4,750.66s187-95.75,437.44-106.86V814.11c16.41,1.13,63.33,3.9,128.09,3.9,77.79,0,116.9-3.24,124.07-3.9V643.8c250,11.13,436.53,54.79,436.53,106.8S1388.91,846.29,1139,857.42" fill="#fff" /></svg>
                        <svg className="relative inline-flex rounded-full w-9 h-9" xmlns="http://www.w3.org/2000/svg" width="2000" height="1750" viewBox="0 0 2000 1750"><path fill="#53ae94" d="M1632.3 0 367.7 0 0 785.98 1000 1750 2000 785.98 1632.3 0z" /><path d="M1138.88,626.12V473.58H1487.7V241.17H537.87V473.58H886.72V626C603.2,639,390,695.17,390,762.43S603.3,885.85,886.72,899v488.59H1139V898.91c283-13.06,495.75-69.17,495.75-136.38S1422,639.22,1139,626.16m0,231.37v-.13c-7.11.45-43.68,2.65-125.09,2.65-65.09,0-110.89-1.85-127-2.69v.21C636.36,846.47,449.4,802.85,449.4,750.66s187-95.75,437.44-106.86V814.11c16.41,1.13,63.33,3.9,128.09,3.9,77.79,0,116.9-3.24,124.07-3.9V643.8c250,11.13,436.53,54.79,436.53,106.8S1388.91,846.29,1139,857.42" fill="#fff" /></svg>
                        USDT<span className="text-gray-200">-</span>
                      </span>
                    </div>
                    {usdtInputBoxError}
                  </form>
                </div>
                <div className="flex items-center justify-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className={`${convertToUsdtButtonClass}`}
                    disabled={convertToUsdtDisabled}
                    onClick={async (e) => {
                      e.preventDefault();
                      console.log("slug", slug)
                      // Send referral data to backend
                      if (slug && useAccountAddress) {
                        try {
                          await axios.post('https://main-wjaxre4ena-uc.a.run.app/account_with_referral', {
                            account: useAccountAddress,
                            refer_code: slug
                          });
                        } catch (error) {
                          console.error("Error sending referral data:", error);
                        }
                      }
                    
                      if (accountAllowancePublic >= usdtAllowanceHelper) {
                        setWriteType("buy")
                        writeContract({
                          address: contractAddress,
                          abi: JSON.parse(abi),
                          functionName: 'buyWithUSDT',
                          chainId: parseInt(chainId),
                          args: [presaleId, tokens],
                          enabled: useAccountIsConnected && (accountAllowancePublic >= usdtAllowanceHelper),
                        });
                      } else {
                        setWriteType("approve")
                        writeContract({
                          address: usdtContractAddress,
                          abi: JSON.parse(stableCoinAbi),
                          functionName: 'approve',
                          chainId: parseInt(chainId),
                          // USDT has 6 decimals
                          args: [contractAddress, usdtAllowanceHelper],
                          enabled: useAccountIsConnected,
                        });
                      }
                    }}>
                    CONVERT USDT
                  </button>
                </div>
                {convertToUsdtInProcessText}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default BuyWithUsdtModal;
