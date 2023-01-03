import React, { useContext, useEffect, useState } from "react";
import useFirebase from "../../Hooks/useFirebase";
import "./Formulario.css";
import { addDoc, collection } from "firebase/firestore";
import Swal from "sweetalert2";
import GlobalContextProvider, {
  GlobalContext,
} from "../../Context/GlobalContextProvider";
import db from "../../Service/Firebase";

const Formulario = ({ cantTotal, compra, cart }) => {
  const { cartTotal, cantidadTotal } = useContext(GlobalContext);

  const [formulario, setformulario] = useState({
    buyer: {
      email: "",
      nombre: "",
      apellido: "",
      telefono: "",
    },
    total: cantTotal.cartTotal,
    items: compra.cantidadTotal,
    purchase: { ...cart.cart },
  });

  /* Completes form  */

  const handleChange = (e) => {
    buttonState();
    const { name, value } = e.target;
    setformulario({
      ...formulario,
      buyer: {
        ...formulario.buyer,
        [name]: value,
      },
      total: cartTotal,
      items: cantidadTotal,
    });
  };

  /* Renders purchase detail in alarm when form is completed */
  const itemRender = () => {
    const compra = formulario.purchase;
    return `${Object.entries(compra).map(
      (prod) =>
        `<p>${prod[1].cantidad} unidades de queso ${prod[1].id}. Valor: $ ${prod[1].precioTotal}</p>`
    )}`;
  };

  /* Alarms to be rendered after success or failure in purchase */

  const compraAlarm = (order) => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Compra exitosa!",

      html:
        `<h4>Detalle de tu compra:</h4>` +
        itemRender() +
        `<h4>Valor total: $ ${cartTotal}</h4>` +
        `<h6>ID de la compra: ${order}</h6>`,
      showConfirmButton: true,
    });
  };

  const errAlarm = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Algo no funcionó bien!",
    });
  };

  const mailAlarm = () => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Ingrese un correo electronico válido!",
    });
  };

  /* Trial function */
  const fetchGenerateTicket = async ({ datos }) => {
    try {
      const col = collection(db, "ordenes");
      const order = await addDoc(col, datos);
      compraAlarm(order.id);
    } catch (error) {
      console.log("error", error);
      errAlarm();
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (ValidateEmail(document.querySelector("input[name='email']").value)) {
      fetchGenerateTicket({ datos: formulario });
      const size = Object.keys(formulario.purchase).length;
    }
  };

  /* Triggers verifying function when cartTotal changes, to avoid a purchase of an empty cart */
  useEffect(() => {
    buttonState();
  }, [cartTotal]);

  /* Validates email address */
  function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    } else {
      mailAlarm();
      return false;
    }
  }

  const [disable, setDisable] = useState(true);

  /* Enables purchase button if fields are populated and cart is not empty */
  const buttonState = () => {
    const email = document.querySelector("input[name='email']");
    const nombre = document.querySelector("input[name='nombre']");
    const apellido = document.querySelector("input[name='apellido']");
    const telefono = document.querySelector("input[name='telefono']");

    if (
      email.value.length != 0 &&
      nombre.value.length != 0 &&
      apellido.value.length != 0 &&
      telefono.value.length != 0 &&
      cartTotal > 0
    ) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  };

  return (
    <>
      <form id="formulario">
        {/* Principio DRY: no repetir campos de input */}
        {Object.keys(formulario.buyer).map((key, index) => (
          <div className="form-group">
            <input
              key={index}
              name={`${key}`}
              value={key.value}
              type="text"
              onChange={handleChange}
              className="form-control"
              placeholder={`${key}`}
            />
          </div>
        ))}

        <div className="form-check"></div>
        <button
          onClick={onSubmit}
          disabled={disable}
          type="submit"
          className="btn btn-warning"
        >
          Confirmar compra
        </button>
      </form>
    </>
  );
};

export default Formulario;
