import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'

import close from '../assets/close.svg'

const Product = ({ item, provider, account, razon, togglePop }) => {

  const [order,setOrder]=useState(null);
  const [hasBought,setHasBought]=useState(false)

  const fetchDetails=async()=>{
    const events=await razon.queryFilter("Buy")
    const orders=events.filter(
      (event)=>event.args.buyer===account && event.args.itemId.toString()===item.id.toString()
    )
    if(orders.length===0)return
      const order=await razon.orders(account,orders[0].args.orderId)
      setOrder(order)
  }

  const buyHandler=async()=>{
    const signer=await provider.getSigner()
    let transaction=razon.connect(signer).buy(item.id,{value:item.cost})
    await transaction.await()
     setHasBought(true)
  }

  useEffect(()=>{
    fetchDetails()
  },[hasBought])

  return (
    <div className="product">
      <div className="product__details">
                <div className="product__image">
                  <img src={item.image} alt="Product"/>
                </div>
                <div className='product__overview'>
                  <h1>{item.name}</h1>
                  <Rating value={item.rating}/>
                  <hr/>
                  <p>{item.address}</p>
                  <h2>{ethers.utils.formatUnits(item.cost.toString(),'ether')} ETH</h2>
                  <hr/>
                  <h2>Overview</h2>
                  <p>
                    {item.description}

                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                     when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                  </p>
                </div>
                <div className='product__order'>
                  <h1>{ethers.utils.formatUnits(item.cost.toString(),'ether')} ETH</h1>
                  <p>
                    Free Delivery <br/>
                    <strong>
                      {new Date(Date.now()+345600000).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}
                    </strong>
                  </p>

                  {item.stock>0?
                  (<p>In stock</p>):(<p>Out of stock</p>)
                  }
                  <button className='product__buy' onClick={buyHandler }>Buy now</button>
                  <p><small>Ship from</small> Razon</p>
                  <p><small>Sell from</small> Razon</p>

                  {order && (
                    <div className='product__bought'>
                      Item bought on <br/>
                      <strong>
                        {new Date(Number(order.time.toString()+"000")).toLocaleDateString(
                          undefined,{
                            weekday:'long',
                            hour:'numeric',
                            minute:'numeric',
                            second:'numeric'
                          }
                        )}
                      </strong>
                    </div>
                  )}
                </div>
                <button className='product__close' onClick={togglePop}>
                  <img src={close} alt="close"/>
                </button>
      </div>
    </div>
  );
}

export default Product;