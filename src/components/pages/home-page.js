import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";

import "./home-page.css";
import hand from "../../img/icons/drag.png";
import rotate from "../../img/icons/rotate.png";
import rotate2 from "../../img/icons/arrow-rotate.png";
import change from "../../img/icons/change.svg";
import Navigation from "../navigation";
import addImg from "../../img/icons/add.png";
import handImg from "../../img/icons/hand.svg";
import textureImg from "../../img/icons/texture.png";
import basketImg from "../../img/icons/basket.png";
import FloorList from "../floor-list";
import Modal from "../modal-window";

import ModalConfirm from "../modal-confirm";
import { selectTypeOfChange, changeStatusCamera, selectActionModel, deleteModel } from "../../actions";

const HomePage = ({
  selectTypeOfChange,
  changeStatusCamera,
  activeObject,
  camera, deleteModel,
  selectActionModel
}) => {
  // console.log(camera, 'camera')
  return (
    <div>
    {/* <ModalConfirm/> */}
      <Modal />
      <Navigation />
      <div className="main">
        <div className="instrum">
          <div className="controls">
            <div
              // className=`{$}` "controls-btn hand"
              className={
                camera.status === "panorama"
                  ? "controls-btn hand controls-btn__active"
                  : "controls-btn hand"
              }
              onClick={() => changeStatusCamera("panorama")}
            >
              <img src={handImg} alt="Logo" />
            </div>{" "}
            <div
              className={
                activeObject.action === "drag"
                  ? "controls-btn hand controls-btn__active"
                  : "controls-btn hand"
              }
              onClick={() => selectActionModel("drag")}
            >
              <img src={hand} alt="Logo" />
            </div>{" "}
            <div
              className={
                activeObject.action === "rotate"
                  ? "controls-btn controls-btn__active"
                  : "controls-btn"
              }
              onClick={() => selectActionModel("rotate")}
            >
              {" "}
              <img src={rotate} alt="Logo" />
            </div>{" "}
            <div
              className="controls-btn"
              // onClick={() => selectTypeOfChange("cancel")}
            >
              <img src={rotate2} alt="Logo" />
            </div>{" "}
            <div
              className="controls-btn"
              onClick={() => selectTypeOfChange("replace")}
            >
              <img src={change} alt="Logo" />
            </div>{" "}
            <div
              className="controls-btn"
              onClick={() => selectTypeOfChange("change_texture")}
            >
              <img src={textureImg} alt="Logo" />
            </div>
            <div
              className="controls-btn"
              onClick={() => selectTypeOfChange("add_model")}
            >
              <img src={addImg} alt="Logo" />
            </div>

            <div
              className="controls-btn"
              onClick={() => selectTypeOfChange("delete_model")}
            >
              <img src={basketImg} alt="Logo" />
            </div>

          </div>

        </div>
      </div>{" "}
      <FloorList />
    </div>
  );
};

class HomePageContainer extends Component {
  render() {
    const { activeObject, selectTypeOfChange, changeStatusCamera, camera, selectActionModel } =
      this.props;

    return (
      <div>
        {" "}
        {/* <button>Выбрать объект</button> */}{" "}
        <HomePage
          camera={camera}
          activeObject={activeObject}
          selectTypeOfChange={selectTypeOfChange}
          changeStatusCamera={changeStatusCamera}
          selectActionModel={selectActionModel}
        />{" "}
      </div>
    );
  }
}

const mapStateToProps = ({ activeObject, camera }) => {
  return {
    activeObject,
    camera,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    selectTypeOfChange: (id) => dispatch(selectTypeOfChange(id)),
    changeStatusCamera: (status) => dispatch(changeStatusCamera(status)),
    selectActionModel: (action) => dispatch(selectActionModel(action))
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  HomePageContainer
);
