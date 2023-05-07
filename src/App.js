import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs 
import Razon from './abis/Razon.json'

// Config
import config from './config.json'

function App() {

  const [account,setAccount]=useState(null);
  const [provider,setProvider]=useState(null);
  const [razon,setRazon]=useState(null);
  const [item,setItem]=useState(null);
  const [toggle,setToggle]=useState(false);

  const [electronics,setElectronics]=useState(null);
  const [toys,setToys]=useState(null);
  const [clothing,setClothing]=useState(null);

  const togglePop=(item)=>{
    setItem(item);
    toggle?setToggle(false):setToggle(true);
  }

  const loadBlockchainData=async()=>{
    const provider=new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const network=await provider.getNetwork()

    const razon=new ethers.Contract(
      config[network.chainId].razon.address,
      Razon.abi,
      provider
    )
    setRazon(razon)

    const items=[]

    for(let i=0;i<9;i++){
      const item=await razon.items(i+1)
      items.push(item)
    }
    
    const electronics=items.filter((item)=>item.category==='electronics')
    const clothing=items.filter((item)=>item.category==='clothing')
    const toys=items.filter((item)=>item.category==='toys')


    setElectronics(electronics)
    setToys(toys)
    setClothing(clothing)
    }

  useEffect(()=>{
    loadBlockchainData()
  },[])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount}/>
      <h2>Welcome to Razon</h2>
      {electronics && toys && clothing && (
        <>
        <Section title={"Clothing & Jewelery"} items={clothing} togglePop={togglePop}/>
        <Section title={"Toys"} items={toys} togglePop={togglePop}/>
        <Section title={"Eletronics"} items={electronics} togglePop={togglePop}/>
        </>
      )}

      {toggle && (
          <Product item={item} provider={provider} account={account} razon={razon} togglePop={togglePop}/>
      )}
    </div>
  );
}

export default App;
