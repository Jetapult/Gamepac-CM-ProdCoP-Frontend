import React, { useRef, useEffect, useState } from 'react';

const SceneConnectionPanel = ({ scenes, activeSceneId, onUpdateTransition }) => {
  const [selectedSourceSprite, setSelectedSourceSprite] = useState(null);
  const [previewConnection, setPreviewConnection] = useState(null);
  const canvasRef = useRef(null);
  const activeScene = scenes.find(scene => scene.id === activeSceneId);

  const CONSTANTS = {
    padding: 20,
    nodeHeight: 60,
    nodeWidth: 140,
    spacing: 30,
    connectorSize: 10,
  };

  useEffect(() => {
    drawSceneFlow();
  }, [scenes, activeSceneId, selectedSourceSprite, previewConnection]);

  const handleSpriteSelect = (spriteId) => {
    setSelectedSourceSprite(spriteId);
    setPreviewConnection({
      sourceSceneId: activeSceneId,
      spriteId: spriteId
    });
  };

  const handleTargetSceneSelect = (targetSceneId) => {
    onUpdateTransition(activeSceneId, targetSceneId, selectedSourceSprite);
    setSelectedSourceSprite(null);
    setPreviewConnection(null);
  };

  const drawSceneFlow = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const padding = 20;
    const nodeHeight = 60;
    const nodeWidth = 140;
    const spacing = 30;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scenes and connections
    scenes.forEach((scene, index) => {
      const x = padding;
      const y = padding + (nodeHeight + spacing) * index;

      // Draw scene box
      ctx.fillStyle = scene.id === activeSceneId ? '#9333ea' : '#444';
      ctx.beginPath();
      ctx.roundRect(x, y, nodeWidth, nodeHeight, 8);
      ctx.fill();

      // Draw scene name
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText(scene.name, x + 10, y + 20);

      // Draw sprite triggers if any
      const triggers = scene.placedSprites?.filter(sprite => 
        sprite.clickAction?.actions?.some(a => a.type === "sceneTransition")
      ) || [];
      
      if (triggers.length > 0) {
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#aaa';
        triggers.forEach((trigger, idx) => {
          const transition = trigger.clickAction.actions.find(a => a.type === "sceneTransition");
          const targetScene = scenes.find(s => s.id === transition.config.targetSceneId);
          ctx.fillText(`↳ ${trigger.frameName} → ${targetScene?.name}`, x + 15, y + 35 + idx * 12);
        });
      }

      // Draw existing connections
      scene.placedSprites?.forEach(sprite => {
        if (sprite.clickAction?.actions?.some(a => a.type === "sceneTransition")) {
          const transition = sprite.clickAction.actions.find(a => a.type === "sceneTransition");
          drawConnection(ctx, {
            sourceSceneId: scene.id,
            targetSceneId: transition.config.targetSceneId,
            spriteName: sprite.frameName
          });
        }
      });

      // Draw preview connection if exists
      if (previewConnection && scene.id === previewConnection.sourceSceneId) {
        const sprite = scene.placedSprites.find(s => s.id === previewConnection.spriteId);
        if (sprite) {
          drawPreviewConnection(ctx, {
            sourceIndex: index,
            spriteName: sprite.frameName
          });
        }
      }
    });
  };

  const drawConnection = (ctx, { sourceSceneId, targetSceneId, spriteName }) => {
    const sourceIndex = scenes.findIndex(s => s.id === sourceSceneId);
    const targetIndex = scenes.findIndex(s => s.id === targetSceneId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const { padding, nodeHeight, nodeWidth, spacing } = CONSTANTS;
    const startX = padding + nodeWidth;
    const startY = padding + (nodeHeight + spacing) * sourceIndex + nodeHeight/2;
    const endX = padding + nodeWidth - 10;
    const endY = padding + (nodeHeight + spacing) * targetIndex + nodeHeight/2;

    // Draw curved connection
    ctx.beginPath();
    ctx.strokeStyle = '#9333ea';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    const controlPointOffset = 80;
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + controlPointOffset, startY,
      startX + controlPointOffset, endY,
      endX, endY
    );
    ctx.stroke();

    // Draw arrow at the end
    const arrowSize = 8;
    ctx.beginPath();
    ctx.fillStyle = '#9333ea';
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - arrowSize, endY - arrowSize);
    ctx.lineTo(endX - arrowSize, endY + arrowSize);
    ctx.closePath();
    ctx.fill();
  };

  const drawPreviewConnection = (ctx, { sourceIndex, spriteName }) => {
    const { padding, nodeHeight, nodeWidth, spacing } = CONSTANTS;
    const startX = padding + nodeWidth;
    const startY = padding + (nodeHeight + spacing) * sourceIndex + nodeHeight/2;

    // Draw dashed preview line following cursor
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.moveTo(startX, startY);
    
    // Draw to cursor position or end of canvas if no cursor
    const endX = startX + 60;
    const endY = startY;
    
    ctx.bezierCurveTo(
      startX + 30, startY,
      endX - 30, endY,
      endX, endY
    );
    ctx.stroke();
    ctx.setLineDash([]);
  };

  return (
    <div className="mt-4 p-4 bg-[#222] rounded h-[600px] overflow-y-auto">
      <h3 className="text-white text-sm font-medium mb-2">Scene Flow</h3>
      
      <canvas
        ref={canvasRef}
        width={300}
        height={scenes.length * 90 + 40}
        className="w-full mb-4 border border-[#444] rounded"
      />

      <div className="mt-4">
        <label className="text-white text-xs block mb-2">Add Transition Trigger:</label>
        <select
          className="w-full p-2 bg-[#333] border border-[#444] text-white rounded mb-2"
          value={selectedSourceSprite || ""}
          onChange={(e) => handleSpriteSelect(e.target.value)}
        >
          <option value="">Select element to trigger transition...</option>
          {activeScene?.placedSprites?.map(sprite => (
            <option key={sprite.id} value={sprite.id}>
              {sprite.frameName}
            </option>
          ))}
        </select>

        {selectedSourceSprite && (
          <select
            className="w-full p-2 bg-[#333] border border-[#444] text-white rounded"
            value=""
            onChange={(e) => handleTargetSceneSelect(e.target.value)}
          >
            <option value="">Select target scene...</option>
            {scenes
              .filter(scene => scene.id !== activeSceneId)
              .map(scene => (
                <option key={scene.id} value={scene.id}>
                  {scene.name}
                </option>
              ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default SceneConnectionPanel;