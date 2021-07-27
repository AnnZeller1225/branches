import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import {
    selectReplaceBy, addModel,
} from "../../actions";
import "./model-list.css";

// id: "20",
//     name: "sofa_2",
//         type: "MODEL",
//             url: "./models/sofa_02.glb",
//                 scale: "2",
//                     texture: "./url",
//                         texture_width: "1",
//                             dots: { x: "0", y: "0", z: "0" },
// visible: true,
//     locked: false,

const ModelList = ({ modelList, selectReplaceBy, status, addModel }) => {
    if (status === 'replace') {
        return (
            <div className="texture-block">
                <ul>
                    {modelList.map((el, ind) => (
                        <li key={ind} 
                        
                        onClick={() => { selectReplaceBy(el) }}>{el.name}</li>
                    ))}
                </ul>
            </div>
        )
    } else if (status === 'add_model') {
        return (
            <div className="texture-block">
                <ul>
                    {modelList.map((el, ind) => (
                        <li key={ind} onClick={() => { addModel(el) }}>{el.name}</li>
                    ))}
                </ul>
            </div>
        )
    }

}
class ModelListContainer extends Component {
    render() {
        const {
            modelList,
            selectReplaceBy,
            addModel,
            status
        } = this.props;

        return (
            <div>
                <ModelList
                    status={status}
                    modelList={modelList}
                    selectReplaceBy={selectReplaceBy}
                    addModel={addModel}
                />
            </div>
        );
    }
}


const mapStateToProps = ({ modelList }) => {
    return {
        modelList
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        selectReplaceBy: (id) => dispatch(selectReplaceBy(id)),
        addModel: (id) => dispatch(addModel(id))
    };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
    ModelListContainer
);
