import React, { useEffect, useRef, useState } from "react";
import { Layer, Stage, Text, Transformer } from "react-konva";
import { v4 as uuidv4 } from "uuid";

const TextComp = () => {
  const [textObj, setTextObj] = useState({
    textEditVisible: false,
    x: 0,
    fill: "black",
    y: 0,
    textValue: "Write text",
    fontSize: 8,
    fontStyle: "normal",
    align: "left",
    width: 200,
    id: uuidv4(),
  });

  const shapeRef = useRef();
  const trRef = useRef();
  const stageRef = useRef();
  const textAreaRef = useRef();

  function setTextareaWidth(newWidth) {
    textAreaRef.current.style.width = newWidth + "px";
    setTextObj({
      ...textObj,
      width: newWidth,
    });
  }

  const textEdit = (e) => {
    // const textArea = document.getElementsByTagName("textarea");
    shapeRef.current.hide();
    trRef.current.hide();
    // textArea?.focus();
    textAreaRef.current.focus();

    const absolutePath = e.target.getAbsolutePosition();
    setTextObj({
      ...textObj,
      textEditVisible: true,
      textX: absolutePath.x,
      textY: absolutePath.y,
      textValue: textObj.textValue,
    });
  };

  const textChange = (e) => {
    console.log(textAreaRef.current);
    setTextObj({
      ...textObj,
      textValue: e.target.value,
    });
  };

  const textSubmit = (e) => {
    console.log(e.keyCode);
    if (e.keyCode === 13) {
      // console.log(shapeRef.current.getScale().x);
      setTextareaWidth(shapeRef.current.width() * shapeRef.current.getScale().x
      );
      textAreaRef.current.style.height =
        shapeRef.current.scrollHeight + shapeRef.current.fontSize() + "px";
      setTextObj({
        ...textObj,
        textEditVisible: false,
      });
      shapeRef.current.show();
    }
  };

  useEffect(() => {
    console.log(shapeRef.current.lineHeight());
    // setTextObj({
    //   ...textObj,
    //   height: shapeRef.current.textArr.textHeight,
    //   width: shapeRef.current.textArr.textWidth,
    // })
    if (shapeRef.current) {
      const shape = shapeRef.current;
      const tr = trRef.current;
      tr.nodes([shape]);
      tr.getLayer().batchDraw();
    }
  }, [shapeRef.current]);

  return (
    <div>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
      >
        <Layer>
          <Text
            ref={shapeRef}
            fontSize={20}
            align={"left"}
            fontStyle={20}
            draggable
            text={textObj.textValue}
            x={100}
            y={100}
            wrap="word"
            width={textObj.width}
            height={textObj.height}
            onClick={(e) => textEdit(e)}
            lineHeight={textObj.lineHeight}
          />
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
      <textarea
        ref={textAreaRef}
        value={textObj.textValue}
        style={{
          display: textObj.textEditVisible ? "block" : "none",
          position: "absolute",
          top: shapeRef.current?.y() + "px",
          left: shapeRef.current?.x() + "px",
          border: 0,
          resize: "none",
          height: shapeRef.current?.height() + "px",
          width: shapeRef.current?.width() + "px",
          fontSize: 20,
          outline: "none",
          overflow: "hidden",
          background: "none",
          lineHeight: shapeRef.current?.lineHeight(),
          transformOrigin: "left top",
          fontFamily: shapeRef.current?.fontFamily(),
        }}
        onChange={(e) => textChange(e)}
        onKeyDown={(e) => textSubmit(e)}
      />
    </div>
  );
};

export default TextComp;
