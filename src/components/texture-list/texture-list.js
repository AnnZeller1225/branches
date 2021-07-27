import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import {
    selectTexture
} from "../../actions";
import "./texture-list.css";
const TextureList = ({ textureList, selectTexture})=> {
return(
    <div className="texture-block">
        <ul>
            {textureList.map((el, ind) => (
                    <li key={ind} onClick={() => { selectTexture(el.id) }}>{el.name}</li>
                ))}
        </ul>
    </div>
)
   
    
}

class TextureListContainer extends Component {
    render() {
        const {
            textureList,
            selectTexture
        } = this.props;

        return (
            <div>
                <TextureList
                textureList={textureList}
                selectTexture={selectTexture}
                />
            </div>
        );
    }
}


const mapStateToProps = ({textureList }) => {
    return {
        textureList
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        selectTexture: (id) => dispatch(selectTexture(id))
    };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
    TextureListContainer
);
