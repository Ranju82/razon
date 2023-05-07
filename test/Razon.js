const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ID=1
const NAME="SHOES"
const CATEGORY="CLOTHING"
const IMAGE="MY_SHOES"
const COST=tokens(1)
const RATING=5
const STOCK=4

describe("Razon", () => {

  let razon, deployer,buyer

  beforeEach(async()=>{
    //set up account
    [deployer,buyer]=await ethers.getSigners()
    console.log(deployer,buyer);

    const Razon=await ethers.getContractFactory("Razon")
    razon=await Razon.deploy()
  })

  describe("Deployment",async()=>{
    it('set the owner',async()=>{
      expect(await razon.owner()).to.equal(deployer.address)
    })
  })

  describe("Listing",async()=>{
    let transaction
    beforeEach(async()=>{
     transaction=await razon.connect(deployer).list(
      ID,
      NAME,
      CATEGORY,
      IMAGE,
      COST,
      RATING,
      STOCK
     )
     await transaction.wait()
    })

    it("Returns an attributes",async()=>{
      const item=await razon.items(ID)
      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
    })

    it("Emits list event",async()=>{
      expect(transaction).to.emit(razon,"List")
    })
  })

  describe("Buying",async()=>{
    let transaction
    beforeEach(async()=>{
     transaction=await razon.connect(deployer).list(
      ID,
      NAME,
      CATEGORY,
      IMAGE,
      COST,
      RATING,
      STOCK
     )
     await transaction.wait()
     transaction=await razon.connect(buyer).buy(ID,{value:COST})
    })

    it("Updates the order count",async()=>{
      const result=await razon.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it("Adds the order",async()=>{
     const order=await razon.orders(buyer.address,1)
     expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it("Updates the contract balance",async()=>{
      const result=await ethers.provider.getBalance(razon.address)
      expect(result).to.equal(COST)
    })

    it("Emits buy event",async()=>{
      expect(transaction).to.emit(razon,"Buy")
    })
  })


  describe("Withdrawing",async()=>{
    let balanceBefore
    beforeEach(async()=>{
     let transaction=await razon.connect(deployer).list(
      ID,
      NAME,
      CATEGORY,
      IMAGE,
      COST,
      RATING,
      STOCK
     )
     await transaction.wait()
     transaction=await razon.connect(buyer).buy(ID,{value:COST})
     await transaction.wait()

     balanceBefore=await ethers.provider.getBalance(deployer.address)

     transaction=await razon.connect(deployer).withdraw()
     await transaction.wait()
    })

    it("Updates the order balance",async()=>{
      const balanceAfter=await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it("Updates the contract balance",async()=>{
      const result=await ethers.provider.getBalance(razon.address)
      expect(result).to.equal(0)
    })
  })
})
