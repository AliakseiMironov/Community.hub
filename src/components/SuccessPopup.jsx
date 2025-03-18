import React from "react";
import { Modal, Button } from "react-bootstrap";

const SuccessPopup = ({ show, onHide }) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Body className="text-center">
       <h4>Мероприятие успешно зарегистрировано!</h4>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="success" onClick={onHide}>ОК</Button>
    </Modal.Footer>
  </Modal>
);

export default SuccessPopup;
