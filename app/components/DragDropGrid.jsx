import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { isEqual } from 'lodash';

const DragHandleIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    className="text-slate-600"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M8 6h8M8 12h8M8 18h8" />
  </svg>
);

const ExpandIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    className="text-slate-600"
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    className="text-white" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const DragDropGrid = () => {
  // Sidebar cards
  const [sourceCards] = useState([
    { id: 1, title: 'Card 1' },
    { id: 2, title: 'Card 2' },
    { id: 3, title: 'Card 3' },
    { id: 4, title: 'Card 4' }
  ]);

  // Grid cards with position management
  const [cards, setCards] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const positionToCoords = (position) => ({
    x: position % 2,
    y: Math.floor(position / 2)
  });

  const coordsToPosition = (x, y) => y * 2 + x;

  const isPositionOccupied = (position, excludeCardId = null) => {
    return cards.some(card => {
      if (card.id === excludeCardId) return false;
      if (card.width === 1) return card.position === position;
      return card.position === position || 
             (card.width === 2 && (card.position === position || card.position + 1 === position));
    });
  };

  const findNextAvailablePosition = (startPosition, excludeCardId = null) => {
    for (let i = 0; i < 6; i++) {
      const position = (startPosition + i) % 6;
      if (!isPositionOccupied(position, excludeCardId)) {
        return position;
      }
    }
    return startPosition;
  };

  const handleExpand = (cardId) => {
    setCards(prevCards => {
      const cardIndex = prevCards.findIndex(c => c.id === cardId);
      const card = prevCards[cardIndex];
      
      if (card.width === 2) {
        return prevCards.map(c =>
          c.id === cardId ? { ...c, width: 1 } : c
        );
      }

      const isInRightColumn = card.position % 2 === 1;
      const adjacentPosition = isInRightColumn ? 
        card.position - 1 : 
        card.position + 1;

      if (!isPositionOccupied(adjacentPosition)) {
        return prevCards.map(c =>
          c.id === cardId ? { ...c, width: 2, position: isInRightColumn ? adjacentPosition : c.position } : c
        );
      }

      const newPosition = findNextAvailablePosition(card.position + 2);
      return prevCards.map(c =>
        c.id === cardId ? { ...c, width: 2, position: newPosition } : c
      );
    });
  };

  const handleDrop = (draggedId, targetPosition) => {
    if (!draggedId) return;

    setCards(prevCards => {
      // Handle new card from sidebar
      if (!prevCards.find(c => c.id === draggedId)) {
        const sourceCard = sourceCards.find(c => c.id === draggedId);
        if (!sourceCard) return prevCards;

        const newCard = {
          ...sourceCard,
          position: targetPosition,
          width: 1
        };

        return [...prevCards, newCard];
      }

      // Handle existing card movement
      const draggedCard = prevCards.find(c => c.id === draggedId);
      if (!draggedCard || draggedCard.position === targetPosition) return prevCards;

      // Check if target position is occupied
      if (isPositionOccupied(targetPosition, draggedId)) {
        const newPosition = findNextAvailablePosition(targetPosition + 1);
        return prevCards.map(c =>
          c.id === draggedId ? { ...c, position: newPosition } : c
        );
      }

      // No card in target position
      return prevCards.map(c =>
        c.id === draggedId ? { ...c, position: targetPosition } : c
      );
    });
  };

  const handleDeleteDrop = (e) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('cardId'));
    if (!draggedId) return;
    setCards(prevCards => prevCards.filter(card => card.id !== draggedId));
  };

  const renderPosition = (position) => {
    const { x, y } = positionToCoords(position);
    const card = cards.find(c => c.position === position);
    const isPartOfExpanded = cards.some(c => 
      c.width === 2 && (
        c.position === position || c.position + 1 === position
      )
    );

    if (isPartOfExpanded && (!card || card.position !== position)) return null;

    return (
      <div
        key={position}
        className={`relative col-start-${x + 1} row-start-${y + 1} ${card?.width === 2 ? 'col-span-2' : 'col-span-1'} h-32 transition-all duration-200`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = parseInt(e.dataTransfer.getData('cardId'));
          if (draggedId) handleDrop(draggedId, position);
        }}
      >
        {card && (
          <div
            draggable
            className={`absolute inset-0 m-2 rounded-lg bg-white shadow-lg border-2 border-slate-200 cursor-move hover:border-blue-400 ${card.width === 2 ? 'col-span-2' : ''}`}
            onDragStart={(e) => {
              e.dataTransfer.setData('cardId', card.id.toString());
              setIsDragging(true);
            }}
            onDragEnd={() => setIsDragging(false)}
            onClick={() => handleExpand(card.id)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-700">{card.title}</h3>
                {card.width === 1 && <ExpandIcon />}
              </div>
              <p className="text-sm text-slate-600">
                {card.width === 2 ? 'Click to collapse' : 'Click to expand'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-64 bg-white shadow-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-700">Available Cards</h2>
        <div className="space-y-2">
          {sourceCards.map(card => (
            <Card 
              key={card.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('cardId', card.id.toString());
                setIsDragging(true);
              }}
              onDragEnd={() => setIsDragging(false)}
              className="cursor-move hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between p-2">
                <CardTitle className="text-sm text-slate-600 font-medium">{card.title}</CardTitle>
                <DragHandleIcon />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 relative">
        <div className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded-xl">
          {[0, 1, 2, 3, 4, 5].map(position => renderPosition(position))}
        </div>

        {isDragging && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDeleteDrop}
            className="absolute bottom-0 left-0 right-0 h-16 bg-red-500 bg-opacity-90 
              flex items-center justify-center text-white rounded-t-lg"
          >
            <TrashIcon />
            <span className="ml-2 font-medium">Drop here to delete</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDropGrid;