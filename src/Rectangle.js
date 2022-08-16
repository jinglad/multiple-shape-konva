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
        onChange({
          ...shapeProps,
          x: shapeRef.current.x(),
          y: shapeRef.current.y(),
          width: Math.max(5, shapeRef.current.width()*shapeRef.current.scaleX()),
          height: Math.max(shapeRef.current.height() * shapeRef.current.scaleY(), 5),
        })
        shapeRef.current.scaleX(1);
        shapeRef.current.scaleY(1);
      }
    }
    />
  )
}

export default Rectangle