import React from "react";
import { render } from "react-dom";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import { v4 as uuidv4 } from 'uuid';

const Rectangle = ({ shapeProps, onSelect, onChange }) => {
  const shapeRef = React.useRef();

  console.log("onSelect ", onSelect);

  return (
    <Rect
      onClick={() => {
        console.log(onSelect(shapeRef));
      }}
      onTap={() => onSelect(shapeRef)}
      // ref={shapeRef.current[getKey]}
      ref={shapeRef}
      {...shapeProps}
      draggable
      onDragEnd={(e) => {
        onChange({
          ...shapeProps,
          x: e.target.x(),
          y: e.target.y()
        });
      }}
      onTransformEnd={(e) => {
        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the store we have only width and height
        // to match the data better we will reset scale on transform end
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);
        onChange({
          ...shapeProps,
          x: node.x(),
          y: node.y(),
          // set minimal value
          width: Math.max(5, node.width() * scaleX),
          height: Math.max(node.height() * scaleY)
        });
      }}
    />
  );
};

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: "red",
    id: uuidv4(),
    name: "rect",
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: "green",
    id: "rect2"
  }
];

const Test = () => {
  const [rectangles, setRectangles] = React.useState(initialRectangles);
  const [selectedId, selectShape] = React.useState(null);
  const [nodesArray, setNodes] = React.useState([]);
  const trRef = React.useRef();
  const layerRef = React.useRef();
  const Konva = window.Konva;

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
      trRef.current.nodes([]);
      setNodes([]);
      // layerRef.current.remove(selectionRectangle);
    }
  };

  const selectionRectRef = React.useRef();
  const selection = React.useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  });

  const updateSelectionRect = () => {
    const node = selectionRectRef.current;
    node.setAttrs({
      visible: selection.current.visible,
      x: Math.min(selection.current.x1, selection.current.x2),
      y: Math.min(selection.current.y1, selection.current.y2),
      width: Math.abs(selection.current.x1 - selection.current.x2),
      height: Math.abs(selection.current.y1 - selection.current.y2),
      fill: "rgba(0, 161, 255, 0.3)"
    });
    node.getLayer().batchDraw();
  };

  const oldPos = React.useRef(null);
  const onMouseDown = (e) => {
    e.evt.preventDefault();
    // const isElement = e.target.findAncestor(".elements-container");
    // const isTransformer = e.target.findAncestor("Transformer");
    // if (isElement || isTransformer) {
    //   return;
    // }

    const pos = e.target.getStage().getPointerPosition();
    selection.current.visible = true;
    selection.current.x1 = pos.x;
    selection.current.y1 = pos.y;
    selection.current.x2 = pos.x;
    selection.current.y2 = pos.y;
    updateSelectionRect();
  };

  const onMouseMove = (e) => {
    e.evt.preventDefault();
    if (!selection.current.visible) {
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    selection.current.x2 = pos.x;
    selection.current.y2 = pos.y;
    updateSelectionRect();
  };

  const onMouseUp = (e) => {
    e.evt.preventDefault();
    oldPos.current = null;
    if (!selection.current.visible) {
      return;
    }

    // setTimeout(() => {
    //   selection.current.visible = false;
    // });

    const selBox = selectionRectRef.current.getClientRect();

    const elements = [];
    layerRef.current.find(".rect").forEach((elementNode) => {
      const elBox = elementNode.getClientRect();
      if (Konva.Util.haveIntersection(selBox, elBox)) {
        elements.push(elementNode);
      }
    });
    // let shapes = layerRef.current.find(".rect");
    // let selected = shapes?.filter((shape) => {
    //   Konva.Util.haveIntersection(selBox, shape.getClientRect());
    // })
    trRef.current.nodes(elements);
    selection.current.visible = false;
    // disable click event
    Konva.listenClickTap = false;
    updateSelectionRect();
  };

  const onClickTap = (e) => {
    // if we are selecting with rect, do nothing
    if (selectionRectRef.current.visible) {
      return;
    }
    let stage = e.target.getStage();
    let layer = layerRef.current;
    let tr = trRef.current;
    // if click on empty area - remove all selections
    if (e.target === stage) {
      selectShape(null);
      setNodes([]);
      tr.nodes([]);
      layer.draw();
      return;
    }

    // do nothing if clicked NOT on our rectangles
    if (!e.target.hasName(".rect")) {
      return;
    }

    // do we pressed shift or ctrl?
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const isSelected = tr.nodes().indexOf(e.target) >= 0;

    if (!metaPressed && !isSelected) {
      // if no key pressed and the node is not selected
      // select just one
      tr.nodes([e.target]);
    } else if (metaPressed && isSelected) {
      // if we pressed keys and node was selected
      // we need to remove it from selection:
      const nodes = tr.nodes().slice(); // use slice to have new copy of array
      // remove node from array
      nodes.splice(nodes.indexOf(e.target), 1);
      tr.nodes(nodes);
    } else if (metaPressed && !isSelected) {
      // add the node into selection
      const nodes = tr.nodes().concat([e.target]);
      tr.nodes(nodes);
    }
    layer.draw();
  };

  return (
    <Stage
      width={window.innerWidth + 400}
      height={window.innerHeight + 400}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchStart={checkDeselect}
      onClick={onClickTap}
    >
      <Layer ref={layerRef}>
        {rectangles.map((rect, i) => {
          return (
            <Rectangle
            key={i}
            shapeProps={rect}
            isSelected={rect.id === selectedId}
            onSelect={(e) => {
              if (e.current !== undefined) {
                let temp = nodesArray;
                if (!nodesArray.includes(e.current)) temp.push(e.current);
                setNodes(temp);
                trRef.current.nodes(nodesArray);
                trRef.current.nodes(nodesArray);
                trRef.current.getLayer().batchDraw();
              }
              selectShape(rect.id);
            }}
            onChange={(newAttrs) => {
              const copyOfRectangles = JSON.parse(JSON.stringify(rectangles));
              const currentIndex = rectangles.findIndex(item => item.id === newAttrs.id);
              copyOfRectangles[currentIndex] = newAttrs;
              setRectangles(copyOfRectangles);
              console.log(copyOfRectangles);
            }}
            />
          );
        })}

        <Transformer
          // ref={trRef.current[getKey]}
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
        <Rect fill="rgba(0,0,255,0.5)" ref={selectionRectRef} />
      </Layer>
    </Stage>
  );
};

export default Test;
