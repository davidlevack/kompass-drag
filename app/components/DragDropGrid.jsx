import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique IDs

// Icons and other components remain the same...

const DragDropGrid = () => {
  // Sidebar card types
  const [sourceCards] = useState([
    { type: 'Card 1', title: 'Card 1' },
    { type: 'Card 2', title: 'Card 2' },
    { type: 'Card 3', title: 'Card 3' },
    { type: 'Card 4', title: 'Card 4' }
  ]);

  // Staging area cards
  const [cards, setCards] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const positionToCoords = (position) => ({
    x: position % 2,
    y: Math.floor(position / 2)
  });

  // Check if a given position is occupied
  const isPositionOccupied = (position) => {
    return cards.some(card => card.position === position);
  };

  // Add a unique card on drop, with a new ID
  const handleDrop = (draggedId, targetPosition) => {
    if (!draggedId) return;

    setCards(prevCards => {
      // Check if the dragged item is a new card from the sidebar
      const sourceCard = sourceCards.find(c => c.type === draggedId);

      if (sourceCard) {
        // Create a new unique card instance
        const newCard = {
          ...sourceCard,
          id: uuidv4(), // Generate a unique ID
          position: targetPosition,
          width: 1,
          x: positionToCoords(targetPosition).x,
          y: positionToCoords(targetPosition).y
        };
        return [...prevCards, newCard];
      }

      // For an existing card in the staging area, just update its position
      return prevCards.map(c => 
        c.id === draggedId ? { ...c, position: targetPosition } : c
      );
    });
  };

  const handleDeleteDrop = (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('cardId');
    setCards(prevCards => prevCards.filter(card => card.id !== draggedId));
  };

  const renderPosition = (position) => {
    const card = cards.find(c => c.position === position);

    return (
      <div
        key={position}
        className={`relative ${position % 2 === 0 ? 'col-start-1' : 'col-start-2'}
          ${Math.floor(position / 2) + 1} h-32 transition-all duration-200`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('cardId');
          handleDrop(draggedId, position);
        }}
      >
        {card && (
          <div
            draggable
            className="absolute inset-0 m-2 rounded-lg bg-white shadow-lg
              border-2 border-slate-200 cursor-move hover:border-blue-400"
            onDragStart={(e) => {
              e.dataTransfer.setData('cardId', card.id);
              setIsDragging(true);
            }}
            onDragEnd={() => setIsDragging(false)}
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-700">{card.title}</h3>
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
              key={card.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('cardId', card.type); // Store card type for identification
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
          {[...Array(16).keys()].map(position => renderPosition(position))}
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