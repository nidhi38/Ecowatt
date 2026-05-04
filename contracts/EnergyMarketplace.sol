// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EnergyMarketplace is ReentrancyGuard {
    IERC20 public token;
    
    struct Listing {
        address seller;
        uint256 amount;
        uint256 pricePerUnit;
        bool active;
    }

    struct UserStats {
        uint256 energySold;
        uint256 energyBought;
        uint256 totalTransactions;
    }

    uint256 public listingCounter;
    mapping(uint256 => Listing) public listings;
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public registeredUsers;

    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 pricePerUnit);
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 amount);
    event UserRegistered(address indexed user);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function registerUser() public {
        require(!registeredUsers[msg.sender], "Already registered");
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender);
    }

    function createListing(uint256 _amount, uint256 _pricePerUnit) public nonReentrant {
        require(registeredUsers[msg.sender], "Not registered");
        require(_amount > 0, "Amount must be positive");
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        listings[listingCounter] = Listing({
            seller: msg.sender,
            amount: _amount,
            pricePerUnit: _pricePerUnit,
            active: true
        });

        emit ListingCreated(listingCounter, msg.sender, _amount, _pricePerUnit);
        listingCounter++;
    }

    function buyEnergy(uint256 _listingId, uint256 _amount) public nonReentrant {
        require(registeredUsers[msg.sender], "Not registered");
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing inactive");
        require(_amount <= listing.amount, "Insufficient energy");

        uint256 cost = _amount * listing.pricePerUnit;
        require(token.transferFrom(msg.sender, listing.seller, cost), "Payment failed");
        require(token.transfer(msg.sender, _amount), "Energy transfer failed");

        listing.amount -= _amount;
        if (listing.amount == 0) {
            listing.active = false;
        }

        userStats[listing.seller].energySold += _amount;
        userStats[listing.seller].totalTransactions += 1;
        userStats[msg.sender].energyBought += _amount;
        userStats[msg.sender].totalTransactions += 1;

        emit ListingSold(_listingId, msg.sender, _amount);
    }

    function getListings() public view returns (Listing[] memory) {
        Listing[] memory activeListings = new Listing[](listingCounter);
        uint256 count = 0;
        for (uint256 i = 0; i < listingCounter; i++) {
            if (listings[i].active) {
                activeListings[count] = listings[i];
                count++;
            }
        }
        return activeListings;
    }

    function getUserStats(address _user) public view returns (UserStats memory) {
        return userStats[_user];
    }
}
