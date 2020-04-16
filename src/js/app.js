App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {

	// Modern dapp browsers...
	if (window.ethereum) {
	  App.web3Provider = window.ethereum;
	  try {
		// Request account access
		await window.ethereum.enable();
	  } catch (error) {
		// User denied account access...
		console.error("User denied account access")
	  }
	}
	// Legacy dapp browsers...
	else if (window.web3) {
	  App.web3Provider = window.web3.currentProvider;
	}
	// If no injected web3 instance is detected, fall back to Ganache
	else {
	  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
	}
	web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
	$.getJSON('RetailSupplyChain.json', function(data) {
	  // Get the necessary contract artifact file and instantiate it with truffle-contract
	  var RetailSupplyChainArtifact = data;
	  App.contracts.RetailSupplyChain = TruffleContract(RetailSupplyChainArtifact);

	  // Set the provider for our contract
	  App.contracts.RetailSupplyChain.setProvider(App.web3Provider);

	  // Use our contract to retrieve and mark the adopted pets
	  //return App.markAdopted();
	});
    return App.bindEvents();
  },

  bindEvents: function() {
	$(document).on('click', '.btn-manufacturer', App.handleManufacturer);
	$(document).on('click', '.btn-shipM', App.handleShipManufacturer);
	$(document).on('click', '.btn-distributer', App.handleDistributer);
	$(document).on('click', '.btn-retailTracking', App.handleRetailTracking);
	$(document).on('click', '.btn-retailer', App.handleRetailer);
	$(document).on('click', '.btn-customer', App.handleCustomer);
	$(document).on('click', '.btn-customerTracking', App.handleCustomerTracking);
	$(document).on('click', '.btn-buy', App.handleBuyProduct);	
  },

  handleManufacturer: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDM').value;
	var product = document.getElementById('productM').value;
	var brand = document.getElementById('brandM').value;
	var locationM = document.getElementById('locationM').value;
	
    var manufacInstance;

	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }
	console.log(accounts);
	  var account = accounts[0];
	  App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		manufacInstance = instance; 
		
		manufacInstance.addProduct.sendTransaction(productID, product, brand, locationM).then(function(hash) {
		web3.eth.getTransaction(hash, function(err, tx) {
			var t = "";
			var tr = "<tr>";
			tr += "<td>"+"Manufacturer"+"</td>";
			tr += "<td>"+document.getElementById('productIDM').value+"</td>";
			tr += "<td>"+tx.hash+"</td>";
			tr += "<td>"+"New Product Created!!"+"</td>";
			tr += "</tr>";
			t += tr;
			document.getElementById("posts").innerHTML += t;
		});
	  });
	  }).then(function(result) {
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleShipManufacturer: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDM').value;
	var agency = document.getElementById('tAgency').value;
	var destAddr = document.getElementById('destAddr').value;
	
    var manufacInstance;
	
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	  var account = accounts[0];

	  var distributerAddress = "0x8c24E5ef7f6Edf9858B7e4A7D886BB94110d4b04";
	  App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		manufacInstance = instance;
		manufacInstance.shipProduct.sendTransaction(productID, agency, destAddr, 0, distributerAddress).then(function(hash) {
		web3.eth.getTransaction(hash, function(err, tx) {
			var t = "";
			var tr = "<tr>";
			tr += "<td>"+"Manufacturer"+"</td>";
			tr += "<td>"+document.getElementById('productIDM').value+"</td>";
			tr += "<td>"+tx.hash+"</td>";
			tr += "<td>"+"Shipped to Distributer"+"</td>";
			tr += "</tr>";
			t += tr;
			document.getElementById("posts").innerHTML += t;
		});
	    });
	  }).then(function(result) {
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleDistributer: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDD').value;
	var agency = document.getElementById('transportD').value;
	var destAddr = document.getElementById('destAddrD').value;
	
    var distInstance;
	
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	var account = accounts[0];
	var retailerAddress = "0x27AE28a5ff997e406C1a7754ee6cD6451bb574CB";
	App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		distInstance = instance;
		distInstance.shipProduct.sendTransaction(productID, agency, destAddr, 1, retailerAddress).then(function(hash) {
			
		web3.eth.getTransaction(hash, function(err, tx) {
			var t = "";
			var tr = "<tr>";
			tr += "<td>"+"Distributer"+"</td>";
			tr += "<td>"+document.getElementById('productIDD').value+"</td>";
			tr += "<td>"+tx.hash+"</td>";
			tr += "<td>"+"Shipped to Retailer"+"</td>";
			tr += "</tr>";
			t += tr;
			document.getElementById("posts").innerHTML += t;
		});
	    });
	  }).then(function(result) {
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleRetailTracking: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDRT').value;	
    var retailInstance;
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	  var account = accounts[0];
	  var len;
	 App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		retailInstance = instance;
		return retailInstance.listAllTrackInfo.call(productID);		
	}).then(function(result) {
		var t = "";
		document.getElementById("trackInfo").innerHTML = t;
		var newRow=document.getElementById('trackInfo').insertRow();
		newRow.innerHTML = "<th id=\"test\" style=\"width: 112px; text-align: center;\"><span style=\"color: #993366;\">Owner</span></th><th style=\"width: 144px; text-align: center;\"><span style=\"color: #993366;\">Location</span></th><th style=\"width: 130.4px; text-align: center;\"><span style=\"color: #993366;\">Description</span></th><th style=\"width: 87.2px; text-align: center;\"><span style=\"color: #993366;\">Time</span></th>";
		var tr;
		console.log(result);
		for(i=1;i<=result.length;i++) {
			if((i%4==1) ) {
				
				tr = "<tr>";
			}
			if((i%4) == 0) {
				var ts = new Date(parseInt(result[i-1]));
				console.log(ts.toString());
				tr += "<td>"+ts.toString()+"</td>";
			} else {
				console.log(web3.toAscii(result[i-1]));
				tr += "<td>"+web3.toAscii(result[i-1])+"</td>";
				
			}
			if((i%4==0)) {
				tr += "</tr>";
				t += tr;
				//console.log(t)
				//document.getElementById("trackInfo").innerHTML += t;
			}
				
		}	
		document.getElementById("trackInfo").innerHTML += t;	
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleRetailer: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDR').value;
	var agency = document.getElementById('transportR').value;
	var destAddr = document.getElementById('destAddrR').value;
	var price = document.getElementById('priceR').value;
    var retailInstance;
	
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	var account = accounts[0];
	App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		retailInstance = instance;
		retailInstance.sellProduct.sendTransaction(productID, agency, destAddr, price).then(function(hash) {
		console.log("Ship to Customer",hash);	
		web3.eth.getTransaction(hash, function(err, tx) {
			var t = "";
			var tr = "<tr>";
			tr += "<td>"+"Retailer"+"</td>";
			tr += "<td>"+document.getElementById('productIDR').value+"</td>";
			tr += "<td>"+tx.hash+"</td>";
			tr += "<td>"+"Shipped to Customer"+"</td>";
			tr += "</tr>";
			t += tr;
			document.getElementById("posts").innerHTML += t;
		});
	    });
	}).then(function(result) {
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleCustomer: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDC').value;
	var destAddr = document.getElementById('destAddrC').value;
	
    var custInstance;
	
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	var account = accounts[0];
	App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		custInstance = instance;
		custInstance.updateTrackInfo.sendTransaction(productID, 3, destAddr, "Product Arrived").then(function(hash) {
		web3.eth.getTransaction(hash, function(err, tx) {
			var t = "";
			var tr = "<tr>";
			tr += "<td>"+"Customer"+"</td>";
			tr += "<td>"+document.getElementById('productIDC').value+"</td>";
			tr += "<td>"+tx.hash+"</td>";
			tr += "<td>"+"Arrived at Customer"+"</td>";
			tr += "</tr>";
			t += tr;
			document.getElementById("posts").innerHTML += t;
		});
	    });
	  }).then(function(result) {
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleCustomerTracking: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDCT').value;	
    var customerInstance;
	console.log("customer called");
	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	  var account = accounts[0];
	  var len;
	 App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		customerInstance = instance;
		console.log("customer listAllTrackInfo");
		return customerInstance.listAllTrackInfo.call(productID);		
	}).then(function(result) {
		var t = "";
		document.getElementById("trackInfo").innerHTML = t;
		var newRow=document.getElementById('trackInfo').insertRow();
		newRow.innerHTML = "<th id=\"test\" style=\"width: 112px; text-align: center;\"><span style=\"color: #993366;\">Owner</span></th><th style=\"width: 144px; text-align: center;\"><span style=\"color: #993366;\">Location</span></th><th style=\"width: 130.4px; text-align: center;\"><span style=\"color: #993366;\">Description</span></th><th style=\"width: 87.2px; text-align: center;\"><span style=\"color: #993366;\">Time</span></th>";
		var tr;
		console.log(result);
		for(i=1;i<=result.length;i++) {
			if((i%4==1) ) {
				
				tr = "<tr>";
			}
			if((i%4) == 0) {
				var ts = new Date(parseInt(result[i-1]));
				console.log(ts.toString());
				tr += "<td>"+ts.toString()+"</td>";
			} else {
				console.log(web3.toAscii(result[i-1]));
				tr += "<td>"+web3.toAscii(result[i-1])+"</td>";
				
			}
			if((i%4==0)) {
				tr += "</tr>";
				t += tr;
				//console.log(t)
				//document.getElementById("trackInfo").innerHTML += t;
			}
				
		}	
		document.getElementById("trackInfo").innerHTML += t;	
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  },
  handleBuyProduct: function(event) {
    event.preventDefault();

    var productID = document.getElementById('productIDCT').value;
	
    var customerInstance;

	web3.eth.getAccounts(function(error, accounts) {
	  if (error) {
		console.log(error);
	  }

	  var account = accounts[0];
	 
	  App.contracts.RetailSupplyChain.deployed().then(function(instance) {
		customerInstance = instance;
		return customerInstance.getSellerAddress.call(productID);
		
	}).then(function(result) {
		console.log("BUY Product",result);
		customerInstance.buyProduct.sendTransaction( productID, {
												    from:account,to:result,//contracts address
												    value: web3.toWei(document.getElementById('amount').value, 'ether')//EtherAmount=>how much ether you want to move
		});
	  }).catch(function(err) {
		console.log(err.message);
	  });
	});
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
