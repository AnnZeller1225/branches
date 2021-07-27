import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import FloorPlane from "../floorplane";
// import hideEye from "../../img/icons/hidden.png";
// import visibleEye from "../../img/icons/visible.png";
// import lockImg from "../../img/icons/lock.png";
// import unlockImg from "../../img/icons/unlock.png";
// import editImg from "../../img/icons/edit.png";
// import addImg from "../../img/icons/add.png";

// import ModalWindow from "../modal-window";
import "./floor-list.css";
import {
  changePositionModel,
  selectModel,
  changeVisibilityModel,
  changeLockModel,
  addModel,
  selectTexture
} from "../../actions";

const FloorList = ({
  project,
  // selectModel,
  // changeVisibilityModel,
  // changeLockModel,
  // addModel,
  // currentWall,
  // textureList,
  // selectTexture
}) => {
  // const { surfaces } = project;
  return (
    <div className="floor-list-wrap">
      <div className="floor-w">
        {/* <div className="block">
          <h2 className="">Что меняем?</h2>
          <div className="furniture-list">
            <p>Мебель</p>
            <div className="furniture-list-img" onClick={() => addModel("red")}>
              <img src={addImg} alt="Logo" />
            </div>
          </div>
          <div className="list">
            {/* {surfaces.map((el, index) => (
              <div className="list-item-w" key={index}>
                <div
                  className="list-item"
                  id={el.id}
                  onClick={() => selectModel(el)}
                >
                  {el.name}
                </div>
                <div className="list-item-wrap-img">
                  <div
                    className="list-item-img"
                    onClick={() => changeLockModel(el)}
                  >
                    <img src={el.locked ? lockImg : unlockImg} alt="Logo" />
                  </div>
                  <div
                    className="list-item-img"
                    onClick={() => changeVisibilityModel(el)}
                  >
                    <img src={el.visible ? visibleEye : hideEye} alt="Logo" />
                  </div>

                  <div
                    className="list-item-img"
                    // onClick={() => changeVisibilityModel(el)}
                  >
                    <img src={editImg} alt="Logo" />
                  </div>
                </div>
              </div>
            ))} */}
          {/* </div> */}
        {/* </div> */} 
        {/* <div className="block">
          <ModalWindow />
        </div> */}
  
      </div>
      <FloorPlane />
    </div>
  );
};

class FloorListContainer extends Component {
  render() {
    const {
      project_1,
      changePositionModel,
      selectModel,
      changingModels,
      changeVisibilityModel,
      changeLockModel,
      addModel,
      currentWall, 
      // textureList,
      // selectTexture
    } = this.props;

    return (
      <div>
        <FloorList
          project={project_1}
          changingModels={changingModels}
          changePositionModel={changePositionModel}
          selectModel={selectModel}
          changeVisibilityModel={changeVisibilityModel}
          changeLockModel={changeLockModel}
          addModel={addModel}
          currentWall={currentWall}
          // textureList={textureList}
          // selectTexture={selectTexture}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ project_1, changingModels, currentWall, textureList }) => {
  return {
    project_1,
    changingModels,
    currentWall,
    textureList
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    changePositionModel: (id) => dispatch(changePositionModel(id)),
    selectModel: (id) => dispatch(selectModel(id)),
    changeVisibilityModel: (id) => dispatch(changeVisibilityModel(id)),
    changeLockModel: (id) => dispatch(changeLockModel(id)),
    addModel: (id) => dispatch(addModel(id)),
    selectTexture: (id)=>dispatch(selectTexture(id))
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  FloorListContainer
);
