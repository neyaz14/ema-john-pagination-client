import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [itemsPerPage, setitemsPerPage] = useState(10);
    const [currentPage , setcurrentPage] = useState(0);
    const {count} = useLoaderData(); 
    // const itemsPerPage = 10;
    const pageNumber = Math.ceil(count/itemsPerPage);
    // console.log(count,pageNumber)
    const pages = [...Array(pageNumber).keys()];
    // console.log(pages)

// all products loading 
    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemsPerPage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        const storedCart = getShoppingCart();
        const savedCart = [];
        // step 1: get id of the addedProduct
        for (const id in storedCart) {
            // step 2: get product from products state by using id
            const addedProduct = products.find(product => product._id === id)
            if (addedProduct) {
                // step 3: add quantity
                const quantity = storedCart[id];
                addedProduct.quantity = quantity;
                // step 4: add the added product to the saved cart
                savedCart.push(addedProduct);
            }
            // console.log('added Product', addedProduct)
        }
        // step 5: set the cart
        setCart(savedCart);
    }, [products])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

// to modify dynamically loading data in the website 
    const handleItemPerPage = (e)=>{
        console.log(e.target.value);
        const val = parseInt(e.target.value)
        setitemsPerPage(val);
        setcurrentPage(0);
    }

    const handlePrev =()=>{
        {currentPage>0 ? setcurrentPage(currentPage-1):setcurrentPage(0)}
    }
    const handleNext=()=>{
        {currentPage<pages.length -1 ? setcurrentPage(currentPage+1): setcurrentPage(currentPage)}
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={cart}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>
            <div className='paginationBTN'>
                <p>Current Page : {currentPage}</p>
                <button onClick={handlePrev}>Prev</button>
                {
                    pages.map(page => <button 
                        className={currentPage === page ? 'selected' :undefined}
                        onClick={()=> setcurrentPage(page)}
                        key={page}>{page}</button>)
                }
                <button onClick={handleNext}>Next</button>
                <select value={itemsPerPage} onChange={handleItemPerPage} name="" id="">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="35">35</option>
                </select>
            </div>
        </div>
    );
};

export default Shop;