import React from 'react';

const Button = ({ btnName, classStyles, handleClick }) => (
  <button
    type="button"
    className={`bg-sky-500 hover:bg-sky-800 text-sm minlg:text-lg py-2 px-6 minlg:px-8 font-poppins font-semibold text-white ${classStyles}`}
    onClick={handleClick}
  >
    {btnName}
  </button>

);

export default Button;
