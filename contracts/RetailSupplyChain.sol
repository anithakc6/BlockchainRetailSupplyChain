pragma solidity ^0.5.0;

contract RetailSupplyChain {
    address payable productOwner;
    enum Participants { manufacturer, distributer, retailer, customer}
    struct Product{
        uint productID;
        string productName;
        string brand;
		string location;
		uint dateTime;
		uint price;
		address payable owner;
    }
	struct ShipmentDetails {
		uint productID;
		string transportAgencyName;
		string destAddress;
	}
	 
	struct TrackDetails {
		string owner;
		string location;
		string description;
		uint time;
	}
    address seller;
    address retailer;
    address distributer;
    modifier isRetailer() {
      require (msg.sender == retailer);
      _;
    }
   
    function isSeller() internal view {
        require (msg.sender == seller);
    }

    function isDistributer() internal view {
        require (msg.sender == distributer);
    }

    constructor() public {
       
    }
    bytes32[] internal trackByteArray; 
    TrackDetails[] internal trackInfo;
    mapping (uint => Product) inventory;
	mapping (uint => ShipmentDetails) shipmentInfo;
	mapping (uint => TrackDetails[]) trackInfoMap;

    function compareStrings (string memory _a, string memory _b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((_a))) == keccak256(abi.encodePacked((_b))) );
    }
    
	function addProduct(uint productID, string memory productName, string memory brand, string memory location) public
    {
	    require(inventory[productID].productID != productID);
	    seller = msg.sender;
        inventory[productID].productID = productID;
        inventory[productID].productName = productName;
        inventory[productID].brand = brand;
		inventory[productID].location = location;
		inventory[productID].dateTime = now;
        inventory[productID].owner = msg.sender;
		TrackDetails memory track = TrackDetails("Manufacturing Unit", location, "Product Manufactured",now);
    	trackInfo.push(track);
		trackInfoMap[productID] = trackInfo;
    }
    function shipProduct(uint productID, string memory transportAgencyName, string memory destAddress, Participants partType, address payable ownerAddr)  public
    {
	    Product memory productDetails = inventory[productID];
	    require(productDetails.productID == productID);
		
        shipmentInfo[productID].productID = productID;
        shipmentInfo[productID].transportAgencyName = transportAgencyName;
		shipmentInfo[productID].destAddress = destAddress;

        TrackDetails memory track;
        if (partType == Participants.manufacturer) {
			isSeller();
			distributer = ownerAddr;
		    track = TrackDetails("Manufacturer", destAddress, "Product Shipped", now);
        } else if (partType == Participants.distributer) {
		    isDistributer();
			retailer = ownerAddr;
            track = TrackDetails("Distributer", destAddress, "Product Shipped", now);
        }
		// Transfer ownership
        inventory[productID].owner = ownerAddr;
    	trackInfo.push(track);
		trackInfoMap[productID] = trackInfo;
    }
	function sellProduct(uint productID, string memory transportAgencyName, string memory destAddress, uint price) isRetailer public
    {
	    Product memory productDetails = inventory[productID];
		
	    require(productDetails.productID == productID);		
        shipmentInfo[productID].productID = productID;
        shipmentInfo[productID].transportAgencyName = transportAgencyName;
		shipmentInfo[productID].destAddress = destAddress;
		
		inventory[productID].price = price;
        TrackDetails memory track;
        track = TrackDetails("Retailer", destAddress, "Product Shipped", now);
    	trackInfo.push(track);
		trackInfoMap[productID] = trackInfo;
    }
	function stringToBytes32(string memory _source) internal pure returns (bytes32 result_) {
        bytes memory tempEmptyStringTest = bytes(_source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
    
        assembly {
            result_ := mload(add(_source, 32))
        }
    }
	function listAllTrackInfo(uint productID) public returns ( bytes32[] memory){
        uint iterator;
        TrackDetails[] memory trackDetails = trackInfoMap[productID];
    	for(iterator = 0;iterator < trackInfoMap[productID].length; iterator++){
            trackByteArray.push(stringToBytes32(trackDetails[iterator].owner));
            trackByteArray.push(stringToBytes32(trackDetails[iterator].location));
            trackByteArray.push(stringToBytes32(trackDetails[iterator].description));
            trackByteArray.push(bytes32(trackDetails[iterator].time));
        }
        return trackByteArray;
    }
	function getTrackInfo(uint productID, uint index) public view returns(string memory owner, string memory location, string memory description, uint time) {
		TrackDetails[] memory trackDetails = trackInfoMap[productID];
		
			return ( trackDetails[index].owner,
					 trackDetails[index].location,
					 trackDetails[index].description,
					 trackDetails[index].time);
	}
	function updateTrackInfo(uint productID, Participants partType, string memory destAddress, string memory description) public {
		TrackDetails memory track;
		Product memory productDetails = inventory[productID];
		
	    require(productDetails.productID == productID);
		if (partType == Participants.customer) {
			track = TrackDetails("Customer", destAddress, description, now);
			trackInfo.push(track);
			trackInfoMap[productID] = trackInfo;
		}
	}
	
    function buyProduct(uint _productID) public payable
    {
        Product memory _product = inventory[_productID];
        // Fetch the owner
        address payable _seller = _product.owner;
        
        // Require that there is enough Ether in the transaction
        require(msg.value >= _product.price);
		require(_product.productID == _productID);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);

        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);

		// Transfer ownership to the buyer
        inventory[_productID].owner = msg.sender;
    }
	function getSellerAddress(uint _productID) public view returns (address){
		return inventory[_productID].owner;
	}
}