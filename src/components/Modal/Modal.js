import React from "react";
import "./Modal.css"; // Ensure to style the modal appropriately

const Modal = ({ content, onClose, filename }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
      <button onClick={onClose}>X</button>
        <h2>{filename}</h2>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Modal;
