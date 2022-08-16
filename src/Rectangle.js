import React from 'react'
import { Rect } from 'react-konva';

const Rectangle = ({shapeProps, onSelect, onChange}) => {
  const shapeRef = React.useRef(null);
  return (
    <Rect
      {...shapeProps}
      onClick={() => onSelect(shapeRef)}
      // onDragStart={() => onChange(shapeRef)}
      onDragEnd={(e) => onChange({
        ...shapeProps,
        x: e.target.x(),
        y: e.target.y(),
      })}
      ref={shapeRef}
      onTap={() => onSelect(shapeRef)}
      name="rectangle"
      draggable
      onTransformEnd={(e) => {
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
          height: node.height() * scaleY
        });
      }
    }
    />
  )
}

export default Rectangle