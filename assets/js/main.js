const network = "eth";
const tokenAddress = "0x525574c899a7c877a11865339e57376092168258";

const menuToggler = () => {
  const toggle = document.querySelector(".page-header-menu__toggle");

  if (!toggle) {
    return;
  }

  toggle.onclick = (e) => {
    const el = e.target.closest(".page-header-menu");
    el?.classList.toggle("show");
    document.documentElement.classList[
      [...el?.classList].includes("show") ? "add" : "remove"
    ]("open-menu");
  };

  window.addEventListener("click", (e) => {
    if (e.target.closest(".page-header-links__link")) {
      e.target.closest(".page-header-menu")?.classList.remove("show");
    }
  });
};

window.addEventListener("load", () => {
  menuToggler();

  const addTokenToMetmaskButtons = document.querySelectorAll(
    ".addTokenToMetmaskId"
  );
  const addNetworkToMetamaskButton = document.querySelector(".addNetworkToMetmaskId")
  addNetworkToMetamaskButton.addEventListener("click", addNetworkToMetmask);
  addTokenToMetmaskButtons.forEach((button) => {
    button.addEventListener("click", addTokenToMetmask);
  });

});

const addTokenToMetmask = async () => {
  const options = {
    address: tokenAddress,
    symbol: "GURU",
    decimals: 18,
    image:
      "https://assets.coingecko.com/coins/images/38583/standard/tGURU_token_circle.png",
  };

  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options,
      },
    });
  } catch (error) {
    console.error(error);
  }
};

async function addNetworkToMetmask () {
  try {
    await ethereum // Or window.ethereum if you don't support EIP-6963.
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x104" }],
      })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902 || switchError.data.originalError.code === 4902) {
      try {
        await ethereum // Or window.ethereum if you don't support EIP-6963.
          .request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x104",
                chainName: "Sage Network",
                rpcUrls: [
                  "https://rpc.gurunetwork.ai/archive/260"
                ],  
                iconUrls: [
                  "https://github.com/dex-guru/assets/blob/main/chains/260/chain_260.svg",
                ],
                nativeCurrency: {
                  "name": "Guru",
                  "symbol": "GURU",
                  "decimals": 18
                },
                blockExplorerUrls: [
                  "https://scan.gurunetwork.ai"
                ]
              },
            ],
          })
      } catch (addError) {
        console.error(addError)
      }
    }
    // Handle other "switch" errors.
  }
};

async function fetchTokenData(baseUrl, tokenAddress) {
  const url = `${baseUrl}/v2/tokens/eth/${tokenAddress}/profile/total`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HTTP error in fetchTokenData! status: ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(`Error pulling data for token ${tokenAddress}: `, error);
  }
}

async function getTokens(baseUrl, tokenIds) {
  const url = `${baseUrl}/v3/tokens`;
  const requestParams = {
    ids: tokenIds,
    network: network.toLowerCase(),
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestParams),
    });

    if (!response.ok) {
      throw new Error(`HTTP error in getTokens! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.data?.[0] || null;
  } catch (error) {
    console.error(`Error pulling data for ${ids}:`, error);
    return null;
  }
}

async function getTxs(baseUrl) {
  const url = `${baseUrl}/wh/total_transactions?api_key=A24AN3aBPjW0jrksmd0N5F6EfyvjGpY9ibVt056v`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"parameters": {"network":"guru_test"}}',
    });

    if (!response.ok) {
      throw new Error(`HTTP error gettings txs! status: ${response.status}`);
    }

    const data = await response.json();
    return data[0].total_transaction_count;
  } catch (error) {
    console.error("Error pulling txs:", error);
    return;
  }
}

async function getGuruRegistered(baseUrl) {
  const fallBackValue = 1542;
  const url = `${baseUrl}/wh/total_nft_season_2_minted?api_key=7lykNVwXEfFevO5hiDklLAqw3KHALeaJBGZkmdwJ`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"parameters": {}}',
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error getting minted NFT! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data[0].total_minted || fallBackValue;
  } catch (error) {
    console.error("Error pulling minted NFT:", error);
    return fallBackValue;
  }
}

async function fetchDataWithSysKey(url, key, method = "GET") {
  const headers = new Headers();
  headers.set("x-sys-key", key);

  try {
    const response = await fetch(url, {
      method,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error pulling data for ${url}:`, error);
    return null;
  }
}

function insertTextById(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = text;
  } else {
    console.error(`Element with id "${elementId}" not found.`);
  }
}

function getFirstSignificantDecimalIndex(value) {
  const formattedValue = value.toLocaleString("en-US", {
    minimumFractionDigits: 18,
  });
  const decimalPart = formattedValue.split(".")[1];
  const match = decimalPart ? decimalPart.match(/^(0+)[^0]/) : null;
  return (match ? match[1].length : 1) + 1;
}

function animateCounter(targetElementId, targetValue) {
  const counter = document.getElementById(targetElementId);
  let startValue = 0;
  const duration = 2000; // Duration of the animation in milliseconds
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1); // Ensure progress doesn't exceed 1
    const currentValue = Math.floor(progress * targetValue);
    counter.innerText = currentValue;

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      counter.innerText = targetValue; // Ensure final value is set
    }
  }

  requestAnimationFrame(updateCounter);
}

function formatNumber(value, options = { leaveTrailingZeroes: false }) {
  if (typeof value === "undefined" || value === null) {
    return "N/A";
  }

  const { leaveTrailingZeroes, ...props } = options;
  const valueNumber = Number(value);

  const minimumFractionDigits = valueNumber < 1 ? 4 : 2;
  const maximumFractionDigits = valueNumber < 1 ? 4 : 2;

  const formattedValue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
    notation: props.notation || "standard",
  }).format(valueNumber);

  return !leaveTrailingZeroes
    ? formattedValue.replace(/\.0+$/, "")
    : formattedValue;
}

window.addEventListener("load", async () => {
  const { camundaApi, apiUrl, apiDev, sysKey } = window.config;

  const tokenId = `${tokenAddress}-${network.toLowerCase()}`;

  if (
    document.getElementById("guruFdv") ||
    document.getElementById("guruTvl")
  ) {
    const totals = await fetchTokenData(apiUrl, tokenAddress);
    insertTextById(
      "guruFdv",
      formatNumber(totals.fullyDilutedValuation, { notation: "compact" })
    );
    insertTextById(
      "guruTvl",
      formatNumber(totals.maxSupply, { notation: "compact" })
    );
  }

  if (
    document.getElementById("guruPrice") ||
    document.getElementById("guruVolume") ||
    document.getElementById("guruLiquidity")
  ) {
    const tokenGuru = await getTokens(apiUrl, [tokenId]);
    insertTextById(
      "guruPrice",
      formatNumber(tokenGuru.priceUSD, { notation: "compact" })
    );
    insertTextById(
      "guruVolume",
      formatNumber(tokenGuru.volume24hUSD, { notation: "compact" })
    );
    insertTextById(
      "guruLiquidity",
      formatNumber(tokenGuru.liquidityUSD, { notation: "compact" })
    );
  }

  if (document.getElementById("guruReg")) {
    const guruReg = await getGuruRegistered(apiDev);
    insertTextById("guruReg", guruReg);
  }

  if (document.getElementById("txsCount")) {
    const txs = await getTxs(apiDev);
    insertTextById("txsCount", formatNumber(txs, { notation: "compact" }));
  }

  if (document.getElementById("operatorDeployed")) {
    const operatorDeployed = await fetchDataWithSysKey(
      `${camundaApi}/process-instance/count`,
      sysKey,
      "POST"
    );
    insertTextById("operatorDeployed", operatorDeployed.count);
    animateCounter("operatorDeployed", operatorDeployed.count);
  }

  if (document.getElementById("flowOrchestrator")) {
    const flowOrchestrator = await fetchDataWithSysKey(
      `${camundaApi}/process-definition/count?latestVersion=true`,
      sysKey
    );
    insertTextById("flowOrchestrator", flowOrchestrator.count);
    animateCounter("flowOrchestrator", flowOrchestrator.count);
  }
});
