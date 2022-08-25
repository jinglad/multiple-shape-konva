import "./App.css";
import { Layer, Rect, Stage, Transformer } from "react-konva";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Rectangle from "./Rectangle";
import { v4 as uuidv4 } from "uuid";

const initialRectangle = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: "red",
    id: uuidv4(),
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: "green",
    id: uuidv4(),
  },
  {
    x: 300,
    y: 300,
    width: 100,
    height: 100,
    fill: "blue",
    id: uuidv4(),
  },
];

function App() {
  const selectionRect = useRef(null);
  const [rectangles, setRectangles] = useState(initialRectangle);
  const [nodesArray, setNodes] = useState([]);
  const trRef = useRef(null);
  const [selectedId, selectShape] = useState(null);
  const layerRef = useRef(null);
  const Konva = window.Konva;
  const selection = useRef({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });

  // useEffect(() => {
  //   setRectangles(initialRectangle);
  // }, []);

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

  const updateSelection = () => {
    const node = selectionRect.current;
    node.setAttrs({
      visible: selection.current.visible,
      x: Math.min(selection.current.x1, selection.current.x2),
      y: Math.min(selection.current.y1, selection.current.y2),
      width: Math.abs(selection.current.x1 - selection.current.x2),
      height: Math.abs(selection.current.y1 - selection.current.y2),
      fill: "rgba(0, 161, 255, 0.3)",
    });
  };

  const onMouseDown = (e) => {
    const isElement = e.target.findAncestor(".elements-container");
    const isTransformer = e.target.findAncestor("Transformer");
    if (isElement || isTransformer) {
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    selection.current.x1 = pos.x;
    selection.current.y1 = pos.y;
    selection.current.x2 = pos.x;
    selection.current.y2 = pos.y;
    selection.current.visible = true;
    updateSelection();
  };

  const onMouseMove = (e) => {
    if (!selection.current.visible) {
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    selection.current.x2 = pos.x;
    selection.current.y2 = pos.y;
    updateSelection();
  };

  const onMouseUp = (e) => {
    if (!selection.current.visible) {
      return;
    }
    const selBox = selectionRect.current.getClientRect();
    const elements = [];
    // console.log({layerRef});
    layerRef.current.find(".rectangle").forEach((node) => {
      const nodeBox = node.getClientRect();
      if (Konva.Util.haveIntersection(selBox, nodeBox)) {
        elements.push(node);
      }
    });
    trRef.current.nodes(elements);
    // console.log({trRef: trRef.current.nodes()});
    selection.current.visible = false;
    Konva.listenClickTap = false;
    updateSelection();
  };

  const onClickTap = (e) => {
    if (selection.current.visible) {
      return;
    }
    let stage = e.target.getStage();
    let layer = layerRef.current;
    let tr = trRef.current;

    if (e.target === stage) {
      selectShape(null);
      tr.nodes([]);
      setNodes([]);
      layer.batchDraw();
      return;
    }
    if (!e.target.hasName("rectangle")) {
      return;
    }

    const metaPressed = e.evt.ctrlKey || e.evt.shiftKey;
    // console.log({nodesArray});
    console.log(e.target)
    const isSelected = nodesArray?.findIndex(node => node.attrs.id === e.target.attrs.id) >= 0;
    console.log({isSelected, metaPressed});

    // console.log({isSelected})
    console.log(nodesArray?.findIndex(node => node.attrs.id === e.target.attrs.id));

    console.log(e.target.attrs.id === tr.nodes()[0].attrs.id);

    if (!metaPressed && !isSelected) {
      // if no key pressed and the node is not selected
      // select just one
      console.log("first");
      tr.nodes([e.target]);
      setNodes([e.target]);
    } 
    else if (metaPressed && isSelected) {
      // if we pressed keys and node was selected
      // we need to remove it from selection:
      console.log("second");
      const nodes = tr.nodes();
      nodes.splice(nodes.findIndex(node => node.attrs.id === e.target.attrs.id), 1);
      tr.nodes(nodes);
      setNodes(nodes);
    } else if (metaPressed && !isSelected) {
      // add the node into selection
      console.log("third");
      let temp = nodesArray;
      if (!nodesArray.includes(e.target)) temp.push(e.target);
      setNodes(temp);
      trRef.current.nodes(nodesArray);
    }
    layer.batchDraw();
  };

  let temp = JSON.parse(JSON.stringify(rectangles));

  // useEffect(() => {
  //   console.log({rectangles})
  // },[rectangles])

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onClickTap}
      onTouchStart={checkDeselect}
    >
      <Layer ref={layerRef}>
        {rectangles?.map((rect, i) => (
          <Rectangle
            key={i}
            shapeProps={rect}
            isSelected={rect.id === selectedId}
            rectangles={JSON.parse(JSON.stringify(rectangles))}
            setRectangles={setRectangles}
            onSelect={(e) => {
              // if (e.current !== undefined) {
              //   let temp = nodesArray;
              //   if (!nodesArray.includes(e.current)) temp.push(e.current);
              //   setNodes(temp);
              //   trRef.current.nodes(nodesArray);
              //   trRef.current.getLayer().batchDraw();
              // }
              selectShape(rect.id);
            }}
            onChange={(newAttrs) => {
              // const copyOfRectangles = JSON.parse(JSON.stringify(temp));
              const currentIndex = temp.findIndex(
                (item) => item.id === newAttrs.id
              );
              if (trRef.current.nodes().length > 1) {
                console.log("inside temp")
                // i++;
                temp[currentIndex] = newAttrs;
                // temp = copyOfRectangles;
                if (temp?.length === i + 1) {
                  console.log("inside inside temp", temp.length, i)
                  setRectangles(temp);
                  // i = 0;
                  console.log(temp)
                }
              } else {
                console.log("outside temp")
                temp[currentIndex] = newAttrs;
                setRectangles(temp);
              }
            }}
          />
        ))}
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
        <Rect fill="blue" ref={selectionRect} />
      </Layer>
    </Stage>
  );
}

export default App;
