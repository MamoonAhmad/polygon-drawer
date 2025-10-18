import { useRef, useEffect, useState } from "react";
import "./App.css";

const drawPolygon = (canvas, area, points) => {
  const ctx = canvas.getContext("2d");

  // Draw lines between points
  if (points.length > 0) {
    ctx.strokeStyle = "#3498db";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.lineTo(points[0].x, points[0].y);

    ctx.stroke();
  }

  // Draw circles (handles)
  points.forEach((point, index) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = index === 0 ? "#e74c3c" : "#3498db";
    ctx.fill();
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw area text above the first point if polygon is closed
  if (area !== null && points.length > 0) {
    const firstPoint = points[0];
    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "#2c3e50";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `Area: ${area.toFixed(2)} px²`,
      firstPoint.x,
      firstPoint.y - 15
    );
  }
};

function App() {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    redraw();
    polygons.forEach((polygon) => {
      drawPolygon(canvasRef.current, polygon.area, polygon.points);
    });
  }, [points, mousePos]);

  // Calculate polygon area using Shoelace formula
  const calculateArea = (polygonPoints) => {
    if (polygonPoints.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < polygonPoints.length; i++) {
      const j = (i + 1) % polygonPoints.length;
      area += polygonPoints[i].x * polygonPoints[j].y;
      area -= polygonPoints[j].x * polygonPoints[i].y;
    }
    return Math.abs(area / 2);
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between points
    if (points.length > 0) {
      ctx.strokeStyle = "#3498db";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      // Draw preview line to mouse position if drawing
      if (isDrawing && mousePos) {
        ctx.lineTo(mousePos.x, mousePos.y);
      } else {
        ctx.lineTo(points[0].x, points[0].y);
      }

      ctx.stroke();
    }

    // Draw circles (handles)
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = index === 0 ? "#e74c3c" : "#3498db";
      ctx.fill();
      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Add new point
    setPoints((prev) => [...prev, { x, y }]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });
  };

  const handleClick = (e) => {
    if (points.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on the first point
    const firstPoint = points[0];
    const distance = Math.sqrt(
      Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
    );

    // If within 10px of the first point, close the shape
    if (distance <= 10) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Draw the closed polygon
      ctx.fillStyle = "rgba(52, 152, 219, 0.3)";
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Calculate and set the area
      const calculatedArea = calculateArea(points);
      setPoints([]);

      setPolygons((polygons) => {
        return [
          ...polygons,
          {
            area: calculatedArea,
            points,
          },
        ];
      });

      // Reset
      setIsDrawing(false);
      setMousePos(null);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onContextMenu={handleContextMenu}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{
        display: "block",
        cursor: "crosshair",
        margin: 0,
        padding: 0,
      }}
    />
  );
}

export default App;
