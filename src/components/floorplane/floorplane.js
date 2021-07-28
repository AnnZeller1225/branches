import React, { useRef, useEffect, Component, useState } from "react";
import { connect } from "react-redux";
import { compose } from "../../utils";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { InteractionManager } from "three.interactive";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import CameraControls from "camera-controls";
import Wall from "../wall";
import {
  changePositionModel,
  selectModel,
  changeStatusCamera,
  resetSelectedModel,
  selectWall,
  selectSurface,
  selectTypeOfChange,
  resetNewModel,
  deleteModel
} from "../../actions";

import {
  initScene,
  initCamera,
  initPointLight,
  initFloor,
  initRenderer,
  findModel,
  isCollision,
  getMouseCoord,
  hideTransformControl,
  createFloor,
  getSharpTexture,
  loadTextureForBox,
  updateCheckCollisionArr
} from "../scripts/initBasicScene.js";

let scene,
  cameraPersp,
  renderer,
  checkCollisionModels,
  control,
  gltfLoader,
  updateUseEffectReplace,
  updateUseEffectVisible,
  updateForAddModel,
  updateUseEffectForDrag,
  updateUseEffectForRotate,
  updateUseEffectForCamera,
  updateUseEffectTexture,
  updateUseEffectTexture__floor,
  updateUseEffectInstrum,
  updateUseEffectDelete,
  clock,
  cameraControls,
  axesHelper,
  outlinedArr,
  movingStatus,
  needOutline,
  composer,
  effectFXAA,
  outlinePass,
  raycaster,
  wallList,
  selectedObjects,
  transformControledModel,
  mouse;
initGlobalLets();

let selectWallDispatch, selectSurfaceDispatch, selectTypeOfChangeDispatch, resetSelectedModelDispatch, changePositionModelDispatch, selectModelDispatch, deleteModelDispatch;
let canvas = renderer.domElement;
let clickManager = new InteractionManager(
  renderer,
  cameraPersp,
  renderer.domElement
);

let outlineParam = {
  edgeStrength: 4,
  edgeGlow: 0,
  edgeThickness: 4,
  visibleEdgeColor: "#ff0f0f",
  hiddenEdgeColor: "#00fad0",
};
//   УБРАТЬ ЛИШНЮЮ ПЕРЕДАЧУ DISPATCHER В ФУНКЦИИ В FLOOR PLANE
// ДОБАВИЛИ МОДЕЛЬ В БОКС, ПО НЕМУ ВЫХОДИЛИ НА МОДЕЛЬ - НЕ ПОДСВЕЧИВАЕТСЯ МОДЕЛЬ. БОКС ПОДСВЕЧИВАЛСЯ
// ЕСЛИ СДЕЛАТЬ БОКС ЧАСТЬЮ МОДЕЛИ  - СВЕТИТСЯ ПО КРУГУ БОКСА

// привязка к control событий каждый раз дублируется при перерендере
const FloorPlane = ({
  project,
  changePositionModel,
  camera,
  changeStatusCamera,
  selectWall,
  selectModel,
  selectSurface,
  selectTypeOfChange,
  modal,
  activeObject,
  resetNewModel,
  modalForConfirm,
  resetSelectedModel
}) => {
  const { surfaces } = project;
  // console.log(currentTexture, "currentTexture");
  const ref = useRef();
  const [replaceModel, setReplaceModel] = useState(null);
  const [visibleModel, setVisibleModel] = useState(null);
  const [addModel, setAddModel] = useState(null);
  const [moveModel, setMoveModel] = useState(null);
  const [rotateModel, setRotateModel] = useState(null);
  const [cameraPanorama, setCameraPanorama] = useState(null);
  const [changeTexture, setChangeTexture] = useState(null);
  const [changeTextureFloor, setChangeTextureFloor] = useState(null);
  const [resetInstr, setResetInstr] = useState(null);

  const [deleteModel, setDeleteModel] = useState(null);

  selectWallDispatch = selectWall; // для передачи локального dispach в addEventListener внешний
  selectSurfaceDispatch = selectSurface;
  selectTypeOfChangeDispatch = selectTypeOfChange;
  changePositionModelDispatch = changePositionModel;
  selectModelDispatch = selectModel;
  resetSelectedModelDispatch = resetSelectedModel;


  deleteModelDispatch = deleteModel;
  checkUpdateForReplace();
  checkUpdateForVisibility();
  checkUpdateForAddModel();
  checkUpdateForMovingModel(); // эти две функции рендерят компонент дважды
  checkUpdateForRotateModel();
  checkUpdateForCamera();
  checkUpdateTexture__wall();
  checkUpdateTexture__floor();
  checkUpdateInstrum();
  checkUpdateDeleteModel();
  // getCube(scene);

  // отрисовывает сцену и свет
  useEffect(() => {
    // console.log(" useEffect_1  ");
    main();
    function main() {
      init();
      animate();
    }

    function init() {
      initRenderer(renderer);
      initScene(scene);
      initCamera(cameraPersp);
      initPointLight(scene);
      initFloor(scene);
      initControls();
      initOutlineComposer(); // для обводки
      ref.current.appendChild(renderer.domElement);
    }
  }, []);
  //  отрисовывает модели или добавляет новую

  // если меняется visible model
  // useEffect(() => {
  // }, [visibleModel]);

  // если добавляем модель
  useEffect(() => {
    if (activeObject.newModel.id && activeObject.isSave && updateForAddModel) {
      loadModel2(activeObject.newModel);
      updateForAddModel = false;
      resetNewModel(); // после загрузки модели сбрасываем выбранну. модели в модалке
    }
  }, [addModel]);

  // режим камеры - панорама
  useEffect(() => {
    if (camera.status === "panorama") {
      console.log("useEffect_7");
      changeMovingCamera(camera.status);
      resetCamera(changeStatusCamera);
    }
  }, [cameraPanorama]);

  // добавляем перемещение
  useEffect(() => {
    if (activeObject.action === "drag" && updateUseEffectForDrag) {
      showAxesControl(activeObject.action);
      movingStatus = "drag";
    }
  }, [moveModel]);
  // добавляем вращение
  useEffect(() => {
    if (activeObject.action === "rotate") {
      // console.log("добавили срелки в use effect для поворота  ");
      showAxesControl(activeObject.action);
      movingStatus = "rotate";
    }
  }, [rotateModel]);
  // обновление текстуры для стен
  useEffect(() => {
    if (updateUseEffectTexture) {
      console.log(" меняем текстуру в юз эф   ");
      updateUseEffectTexture = !updateUseEffectTexture;

      changeTextureWall(activeObject.wall, activeObject.newTexture);
    }
  }, [changeTexture]);
  // текстура для пола
  useEffect(() => {
    if (updateUseEffectTexture__floor) {
      updateUseEffectTexture__floor = !updateUseEffectTexture__floor;
      getChangeTextureFloor(activeObject);
    }
  }, [changeTextureFloor]);

  // добавление стен, пола и моделей
  useEffect(() => {
    addWalls(project.walls);
    let floor = createFloor(project.floor);

    floor.userData = {
      type: project.floor.type,
      ...floor.userData,
      id: project.floor.id,
      name: project.floor.name,
      click: 0,
      outlinePass: true,
    };
    scene.add(floor);
    wallList.push(floor);

    addObjectsFromStore(
      surfaces,
      selectModel,
      resetSelectedModel
    );
  }, []);

  // замена модели
  useEffect(() => {
    if (
      activeObject.action === "replace" &&
      activeObject.newModel.id && updateUseEffectReplace
    ) {
      updateUseEffectReplace = false;
      gltfLoader.load(`${activeObject.newModel.url}`, (gltf) => {
        let root = gltf.scene;
        root.userData = {
          ...activeObject.selectedModel,
          name: activeObject.newModel.name,
          id: activeObject.newModel.id,
          click: 0,
        };
        let { x, y, z } = activeObject.selectedModel.dots;
        root.position.set(Number(x), Number(y), Number(z));

        scene.add(root);
        transformControledModel = root;
        // scene.remove(findModel(scene.children, activeObject.selectedModel.id));

        // control.detach();
        // control.dispose();
        let j = {
          id: 1
        }

        // scene.remove(control);
        // console.log(scene.children);
        // root.addEventListener("click", () => {
        //   addTransformControl(root);
        //   root.userData.click += 1;
        //   highlightModel(root, activeObject.selectedModel);
        // });
        clickManager.add(root);
        checkCollisionModels.push(root);



        checkCollisionModels = updateCheckCollisionArr(checkCollisionModels, activeObject.selectedModel.id);
        wallList.push(root);
        outlinedArr.push(root);

        resetNewModel();

      });


    }
  }, [replaceModel]);
  // удаление модели
  useEffect(() => {
    if (
      activeObject.action === "delete_model" && activeObject.selectedModel?.id && updateUseEffectDelete
    ) {
      updateUseEffectDelete = false;

      let model = findModel(scene.children, activeObject.selectedModel.id)
      model.material = undefined;
      model.geometry = undefined;
      control.detach();
      scene.remove(model);
      scene.remove(control)
      resetSelectedModel();
    }
  }, [deleteModel]);


  // сброс стрелок для моделей
  useEffect(() => {
    if (updateUseEffectInstrum) {
      // movingStatus = null;
      hideTransformControl(control);
      updateUseEffectInstrum = !updateUseEffectInstrum;
      movingStatus = null;
    }
  }, [resetInstr]);

  function checkUpdateForReplace() {
    if (
      activeObject.action === "replace" &&
      updateUseEffectReplace === false &&
      activeObject.newModel?.id && activeObject.isSave
    ) {
      setReplaceModel(replaceModel + 1);
      updateUseEffectReplace = true;
    }
  }

  function checkUpdateForVisibility() {
    if (
      activeObject.model?.id &&
      updateUseEffectVisible === false &&
      activeObject.action === "visibility"
    ) {
      setVisibleModel(visibleModel + 1);
      updateUseEffectVisible = true;
    }
  }

  function checkUpdateForAddModel() {
    if (activeObject.newModel.id && updateForAddModel === false && activeObject.isSave && activeObject.action === 'add_model') {
      setAddModel(addModel + 1);
      updateForAddModel = true;
    }
  }

  function checkUpdateForMovingModel() {
    if (
      activeObject.action === "drag" &&
      updateUseEffectForDrag === false

    ) {
      setMoveModel(moveModel + 1);
      updateUseEffectForDrag = true;
      updateUseEffectForRotate = false;
    }
  }

  function checkUpdateForRotateModel() {
    if (
      activeObject.action === "rotate" &&
      updateUseEffectForRotate === false
    ) {
      setRotateModel(rotateModel + 1);
      updateUseEffectForRotate = true;
      updateUseEffectForDrag = false;
    }
  }

  function checkUpdateForCamera() {
    if (camera.status === "panorama" && updateUseEffectForCamera === false) {
      setCameraPanorama(cameraPanorama + 1);
      updateUseEffectForCamera = true;
    }
  }

  function changeTextureWall(currentWall, currentTexture) {
    scene.children.forEach((el) => {
      if (el.type === "Mesh" && el.userData.id === currentWall.id) {
        el.material[currentWall.sideInd] = loadTextureForBox(
          currentTexture,
          el.userData.size.width,
          el.userData.size.height
        );
      }
    });
  }

  function getChangeTextureFloor(obj) {
    scene.children.forEach((el) => {
      if (el.type === "Mesh" && el.userData.type === obj.surface.type) {
        let texture = getSharpTexture(obj.newTexture);
        var mat = new THREE.MeshBasicMaterial({ map: texture });
        el.material = mat;
      }
    });
  }

  function checkUpdateTexture__wall() {
    if (
      updateUseEffectTexture === false &&
      activeObject.action === "change_texture" &&
      activeObject.wall.id &&
      activeObject.newTexture && activeObject.isSave
    ) {
      console.log(' меняем текстуру стены ');
      setChangeTexture(changeTexture + 1);
      updateUseEffectTexture = true;
    }
  }

  function checkUpdateTexture__floor() {
    if (
      updateUseEffectTexture__floor === false && activeObject.action === "change_texture" &&
      activeObject.surface.id &&
      activeObject.newTexture && activeObject.isSave
    ) {
      setChangeTextureFloor(changeTextureFloor + 1);
      updateUseEffectTexture__floor = true;
    }
  }
  function checkUpdateInstrum() {
    if (
      activeObject.action === "reset" &&
      updateUseEffectInstrum === false
    ) {

      setResetInstr(resetInstr + 1);
      updateUseEffectInstrum = true;
    }
  }

  function checkUpdateDeleteModel() {
    if (
      activeObject.action === "delete_model" && activeObject.selectedModel?.id &&
      updateUseEffectDelete === false && modalForConfirm.confirmed
    ) {

      setDeleteModel(deleteModel + 1);
      updateUseEffectDelete = true;
    }
  }


  // стандартная функция добавленияя модели на сцену
  function loadModel(modelJson) {

    gltfLoader.load(`${modelJson.url}`, (gltf) => {
      let root = gltf.scene;
      const { x, y, z } = modelJson.dots;
      root.rotation.y = modelJson.rotate;
      root.userData = {
        ...root.userData, ...modelJson,
        click: 0,
      };

      root.position.set(Number(x), Number(y), Number(z));

      root.addEventListener("click", (event) => {

        root.userData.click += 1;
        transformControledModel = root;
        highlightModel(root, modelJson);

        // выбивало ошибку при удалении моделей, делаем проверку на то, состоит ли в сцене модель
        if (root.parent) {
          addTransformControl(root);
        }
      });
      clickManager.add(root);
      checkCollisionModels.push(root);
      wallList.push(root);
      outlinedArr.push(root);
      scene.add(root);

    });
  }


  function loadModel2(modelJson) {
    // сделать сброс модакли или чегто
    console.log(' загрузили модель ');
    gltfLoader.load(`${modelJson.url}`, (gltf) => {
      let root = gltf.scene;
      const { x, y, z } = modelJson.dots;
      root.rotation.y = modelJson.rotate;
      root.userData = {
        ...root.userData,
        type: modelJson.type,
        name: modelJson.name,
        id: modelJson.id,
        startPosition: { x, y, z },
        click: 0,
      };

      root.position.set(0, 0, 0);
      root.addEventListener("click", (event) => {
        root.userData.click += 1;
        transformControledModel = root;
        addTransformControl(root);
        highlightModel(root, modelJson);

        // тут отправлять диспач про выбранную модель
      });
      clickManager.add(root);
      checkCollisionModels.push(root);
      wallList.push(root);
      outlinedArr.push(root);
      scene.add(root);
    });
  }

  // добавляем модели
  function addObjectsFromStore(arr) {
    arr.map((el) => {
      loadModel(el);
    });
  }

  function addWalls(arr) {
    // тут решить вопрос с правильным поворотом груп - перепутала угол поворота
    // const group = new THREE.Group();
    arr.forEach((wall) => {
      let addedWall = Wall(wall);

      addedWall.userData = {
        ...addedWall.userData,
        id: wall.id,
        name: wall.name,
        type: "WALL",
        click: 0,
        outlinePass: true,
      };
      addedWall.material.side = THREE.DoubleSide;
      wallList.push(addedWall);

      // console.log(addedWall, 'addedWall');
      scene.add(addedWall);
    });
    // scene.add(group);
  }
  return (
    <>
      <div ref={ref} />{" "}
    </>
  );
};

class FloorPlaneContainer extends Component {
  render() {
    const {
      project_1,
      changePositionModel,
      changingModels,
      currentModel,
      addedModel,
      selectModel,
      camera,
      changeStatusCamera,
      resetSelectedModel,
      selectWall,
      selectSurface,
      selectTypeOfChange,
      currentWall,
      currentTexture,
      currentSurface,
      modal,
      activeObject,
      resetNewModel,
      deleteModel,
      modalForConfirm
    } = this.props;

    return (
      <div className="FloorPlaneC">
        <FloorPlane
          project={project_1}
          currentModel={currentModel}
          changingModels={changingModels}
          changePositionModel={changePositionModel}
          addedModel={addedModel}
          selectModel={selectModel}
          camera={camera}
          changeStatusCamera={changeStatusCamera}
          resetSelectedModel={resetSelectedModel}
          selectWall={selectWall}
          selectSurface={selectSurface}
          selectTypeOfChange={selectTypeOfChange}
          currentWall={currentWall}
          currentTexture={currentTexture}
          currentSurface={currentSurface}
          modal={modal}
          activeObject={activeObject}
          resetNewModel={resetNewModel}
          deleteModel={deleteModel}
          modalForConfirm={modalForConfirm}
        />{" "}
      </div>
    );
  }
}

const mapStateToProps = ({
  project_1,
  changingModels,
  currentModel,
  addedModel,
  camera,
  modal,
  activeObject,
  modalForConfirm
}) => {
  return {
    project_1,
    changingModels,
    currentModel,
    addedModel,
    camera,
    modal,
    activeObject,
    modalForConfirm
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    changePositionModel: (id) => dispatch(changePositionModel(id)),
    selectModel: (id) => dispatch(selectModel(id)),
    changeStatusCamera: (status) => dispatch(changeStatusCamera(status)),
    resetSelectedModel: () => dispatch(resetSelectedModel()),
    selectWall: (id, ind) => dispatch(selectWall(id, ind)),
    selectSurface: (id) => dispatch(selectSurface(id)),
    selectTypeOfChange: (status) => dispatch(selectTypeOfChange(status)),
    resetNewModel: () => dispatch(resetNewModel()),
    deleteModel: (obj) => dispatch(deleteModel(obj))
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  FloorPlaneContainer
);

function initOutlineComposer() {
  composer = new EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);

  const renderPass = new RenderPass(scene, cameraPersp);
  composer.addPass(renderPass);

  outlinePass = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    cameraPersp
  );
  composer.addPass(outlinePass);
  effectFXAA = new ShaderPass(FXAAShader);

  effectFXAA.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );
  composer.addPass(effectFXAA);
  renderer.domElement.style.touchAction = "none";
  outlinePass.edgeStrength = outlineParam.edgeStrength;
  outlinePass.edgeGlow = outlineParam.edgeGlow;
  outlinePass.edgeThickness = outlineParam.edgeThickness;
  outlinePass.visibleEdgeColor.set(outlineParam.visibleEdgeColor);
  outlinePass.hiddenEdgeColor.set(outlineParam.hiddenEdgeColor);
}

function initGlobalLets() {
  scene = new THREE.Scene();
  cameraPersp = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  cameraPersp.position.set(0, 0, 8);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  checkCollisionModels = []; // массив всех объектов для пересечения
  control = new TransformControls(cameraPersp, renderer.domElement);
  gltfLoader = new GLTFLoader();
  axesHelper = new THREE.AxesHelper(15);
  movingStatus = null;

  updateUseEffectReplace = false;
  updateUseEffectVisible = false;
  updateForAddModel = false;
  updateUseEffectForDrag = false;
  updateUseEffectForRotate = false;
  updateUseEffectForCamera = false;
  updateUseEffectTexture = false;
  updateUseEffectTexture__floor = false;
  updateUseEffectInstrum = false;
  updateUseEffectDelete = false;

  wallList = []; // список стен доступных для клика
  selectedObjects = []; // для обводки
  outlinedArr = []; // обводка
}

const showAxesControl = (typeOfChange) => {
  if (typeOfChange === "drag") {
    updateUseEffectForDrag = false;
    control.setMode("translate");
    control.showY = false;
    control.showX = true;
    control.showZ = true;
  } else if (typeOfChange === "rotate") {
    updateUseEffectForRotate = false;
    control.setMode("rotate");
    hideTransformControl(control);
    control.showY = true;
  } else {
    hideTransformControl(control);
  }
};

function resetCamera(changeStatusCamera) {
  window.addEventListener("mouseup", function (event) {
    changeStatusCamera("default");
  });
}

function changeMovingCamera(status) {
  cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK;
  status === "panorama"
    ? (cameraControls.mouseButtons.left = CameraControls.ACTION.TRUCK)
    : (cameraControls.mouseButtons.left = CameraControls.ACTION.ROTATE);
}

// ФУНКЦИИ ДЛЯ THREE JS ФУНКЦИИ ДЛЯ THREE JS ФУНКЦИИ ДЛЯ THREE JSФУНКЦИИ ДЛЯ THREE JS ФУНКЦИИ ДЛЯ THREE JS
function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  cameraPersp.aspect = width / height;
  cameraPersp.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);

  effectFXAA.uniforms["resolution"].value.set(
    1 / window.innerWidth,
    1 / window.innerHeight
  );
}

function render() {
  renderer.render(scene, cameraPersp);
}

function initControls() {
  clock = new THREE.Clock();
  CameraControls.install({ THREE: THREE });
  cameraControls = new CameraControls(cameraPersp, renderer.domElement);
  scene.add(axesHelper);
}

function animate() {
  // cameraPersp.lookAt(0, 0, 0); // вокруг чего крутится камера?
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  const hasControlsUpdated = cameraControls.update(delta);
  if (hasControlsUpdated) {
    renderer.render(scene, cameraPersp);
    composer.render();
  } else if (needOutline) {
    composer.render();
  } else {
    renderer.render(scene, cameraPersp);
  }
}
function onDraginigchange(event) {
  cameraControls.enabled = !event.value;
}

function addSelectedObject(object) {
  // для обведения модели
  selectedObjects = [];
  selectedObjects.push(object);
}
// ОСНОВНЫЕ ФУНКЦИИ РАБОТЫ С ОБЪЕКТАМИ ОСНОВНЫЕ ФУНКЦИИ РАБОТЫ С ОБЪЕКТАМИ ОСНОВНЫЕ ФУНКЦИИ РАБОТЫ С ОБЪЕКТАМИОСНОВНЫЕ ФУНКЦИИ РАБОТЫ С ОБЪЕКТАМИ ОСНОВНЫЕ ФУНКЦИИ РАБОТЫ С ОБЪЕКТАМИ
function removeAllHightLight(arr) {
  arr.forEach((model) => {
    if (model.type === "Group" || model.type === "Mesh") {
      model.userData.selected = false;
      model.userData.click = 0;
    }
  });
}
function addTransformControl(model) {
  model.userData.currentPosition = new THREE.Vector3();

  control.addEventListener("change", render);
  control.addEventListener(
    "objectChange",
    function (el) {
      // isCollision(el, checkCollisionModels); // проблема где то тут
      el.target.children[0].object.userData.currentPosition.copy(
        el.target.children[0].object.position
      );
    },
    false
  );
  control.userData.name = "transformControl";
  control.addEventListener(
    "dragging-changed",
    (event) => onDraginigchange(event, model),
    false
  );

  scene.add(control);
  showAxesControl(movingStatus);
  control.attach(model);
}

control.addEventListener("mouseUp", (event) => handlerClick(event, transformControledModel));
// отправляет данные в стор как то переименовать
function handlerClick(event, model) {

  model.userData.click = 2; // после переноса чтобы подсветка могла пропасть
  let { x, y, z } = event.target._plane.object.userData.currentPosition;
  model.userData.dots = event.target._plane.object.userData.currentPosition;
  let modelInfo = {
    dots: { x, y, z },
    rotate: event.target._plane.object.rotation.y,
    id: event.target._plane.object.userData.id,
  };
  changePositionModelDispatch(modelInfo);
}
function removeHightLight(model) {
  control.visible = false;
  model.userData.click = 0;

  selectedObjects = [];
  outlinePass.selectedObjects = selectedObjects;
  addSelectedObject(model);
  resetSelectedModelDispatch();
}

function highlightModel(model) {
  // console.log(model, "hl m");
  selectModelDispatch(model.userData)
  // если клик не четный и если модель уже не была выбранна
  if (model.userData.click % 2 > 0 && model.userData.selected !== true) {
    removeAllHightLight(scene.children, model);
    // console.log(" добавляем подсветку, удаляя предыдущие ");
    needOutline = true;
    model.userData.selected = true;
    addSelectedObject(model);
    outlinePass.selectedObjects = selectedObjects;
  } // если повторно кликаем на одну и ту же модель
  else if (model.userData.click % 2 === 0 && model.userData.click > 1) {
    // console.log(" кликнутая модель");
    model.userData.selected = true;
    needOutline = true;
    removeAllHightLight(scene.children, model);
  } else if (model.userData.selected === true) {
    // console.log("была true");
    needOutline = false;
    removeHightLight(model);
    model.userData.selected = false;
  } else {
    console.log("exseption highlightModel");
  }
}

function onClick(event) {
  // console.log(control.showX, control.visible,"control.showX");
  if (control.showX === false || control.visible === false) {
    getMouseCoord(event, canvas, mouse);
    checkingClick();
  }
}
// ПОДКЛЮЧИТЬ ОДНОВРЕМЕННО КЛИК И КЛИК МЕНЕДЖЕР И ДЕЛАТЬ ПРОВЕРКУ НА СУЩЕСТВОВАНИЕ В ЮЗЕР ДАТЕ СВОЙСТВ, ЕСДИ ИХ НЕТ ПСТЬ РАБОТАЕТ КЛИК МЕНЕДЖЕР
// поставить флаг для трансформ контролс чтобы по клику не срабатывал общий клик
function checkingClick() {
  raycaster.setFromCamera(mouse, cameraPersp);
  var intersects = raycaster.intersectObjects(wallList, true);
  if (intersects.length > 0) {
    let event = intersects[0];
    if (event.object.userData.type === "FLOOR_SHAPE") {
      const root = intersects[0].object;
      let eventId = root.userData.id;
      root.userData.click += 1;
      highlightModel(root, null);
      // console.log('FLOOR_SHAPE', root)
      selectSurfaceDispatch(eventId);
    } else if (event.object.userData.type === "WALL") {
      let eventId = intersects[0].object.userData.id;
      let side = Math.floor(event.faceIndex / 2);
      console.log(side, 'side in floorp');
      selectWallDispatch(eventId, side);
      const root = intersects[0].object;
      root.userData.click += 1;
      highlightModel(root, null);
    } else if (event.object.userData.type === "MODEL") {
      const root = intersects[0].object.children[0];
      root.userData.click += 1;
      highlightModel(root, null);
    } else {
      // console.log("event exception  ");
    }
    // console.log(wall, 'floor?')
  }
}
//  ОБРАБОТЧИКИ СОБЫТИЙ
// РАЗОБРАТЬСЯ С ТЕМ КАК ПРИВЯЗАНЫ СОБЫТИЯ ВНУТРИ КОМПОНЕНТА - ОНИ ПРИ ПЕРЕРЕНДЕРЕ ЗАНОВО ПОДВЯЗЫВВАЮТСЯ?
window.addEventListener("resize", onWindowResize);
canvas.addEventListener("click", onClick);
window.addEventListener("mouseup", function (event) {
  changeMovingCamera("default");
  updateUseEffectForCamera = false;
});

export { clickManager };
