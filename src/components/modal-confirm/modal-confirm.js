import React from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import "./modal-confirm.css";
import { confirmModal } from "../../actions";
const modalForConfirm = ({ modalForConfirm, confirmModal, opened }) => {
  return (
    <div className={(modalForConfirm.isOpen) ? "phone-confirm" : "hide"}>
      <div className="confirm-w">
        <p>Вы уверены, что хотите удалить элемент?</p>
        <div className="confirm-btns">
          <button className="modal-item" onClick={() => confirmModal(true)}>
            Да
          </button>
          <button className="modal-item" onClick={() => confirmModal(false)}>
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ modalForConfirm }) => {
  return {
    modalForConfirm,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    confirmModal: (status) => dispatch(confirmModal(status)),
  };
};


// export default modalForConfirm;
export default compose(connect(mapStateToProps, mapDispatchToProps))(
  modalForConfirm
);
