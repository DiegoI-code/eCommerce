import React, { createContext, useEffect, useState } from "react";
import db from "../Service/Firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";

export const GlobalContext = createContext("");

const GlobalContextProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setcartTotal] = useState(0);
  const [cantidadTotal, setcantidadTotal] = useState(0);

  // Keeps track of total purchase
  let total = 0;
  const contadorTotal = () => {
    cart.map((x) => (total += x.precioTotal));
    setcartTotal(total);
  };

  let cantiTotal = 0;
  const contadorCantTotal = () => {
    cart.map((x) => (cantiTotal += x.cantidad));
    setcantidadTotal(cantiTotal);
  };

  const eliminarProd = (producto) => {
    let copiaArray = cart;
    const indexProd = copiaArray.findIndex((x) => x.id === producto);
    copiaArray.splice(indexProd, 1);
    setCart(copiaArray);
    contadorTotal();
    contadorCantTotal();
  };

  /* Items and values in Cart are updated when "cart" changes.  */
  useEffect(() => {
    contadorTotal();
    contadorCantTotal();
  }, [cart]);


  /* Detects if product is already in Cart. If not, returns -1 */
  const isInCart = (producto) => {
    return cart.findIndex((x) => x.id === producto);
  };

  /* Adds content to Cart.  */
  const addToCart = (producto, cantidad, precio, stock) => {
    if (isInCart(producto) == -1) {
      const nuevoObj = {
        id: producto,
        cantidad: cantidad,
        stock: stock,
        precio: precio,
        precioTotal: precio * cantidad,
      };
      setCart([...cart, nuevoObj]);
    } else {
      const cantNueva = cart[isInCart(producto)].cantidad + cantidad;
      const precioTotNuevo =
        cart[isInCart(producto)].precioTotal + precio * cantidad;
      const newArray = [...cart];
      newArray[isInCart(producto)].cantidad = cantNueva;
      newArray[isInCart(producto)].precioTotal = precioTotNuevo;
      setCart(newArray);
    }
  };

  const clear = () => setCart([]);

  /* AGREGADO AHORA CONSULTA A BASE DE DATOS  */

  const [dataProds, setdataProds] = useState([]);

  /* Gets data from API */

  const getData = async () => {
    const col = collection(db, "Productos");
    try {
      const data = await getDocs(col);
      const result = data.docs.map(
        (doc) => (doc = { id: doc.id, ...doc.data() })
      );
      setdataProds(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        clear,
        cartTotal,
        cantidadTotal,
        eliminarProd,
        dataProds,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextProvider;
