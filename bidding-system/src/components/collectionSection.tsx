"use client";
import { useState } from "react";
import { Collection } from "@/common/models/collection";
import BidItem from "./bidItem";
import { Bid } from "@/common/models/bid";
import BidModal from "./bidModal";
import CollectionModal from "./collectionModal";
import { useAcceptBid } from "@/common/hooks/bid/useAcceptBid";
import { useRejectBid } from "@/common/hooks/bid/useRejectBid";
import { useCancelBid } from "@/common/hooks/bid/useCancelBid";
import { useDeleteCollection } from "@/common/hooks/collection/useDeleteCollection";

interface CollectionSectionProps {
  collection: Collection;
  currentUserId: string;
  onCollectionsChange: () => void;
}

export default function CollectionSection({
  collection,
  currentUserId,
  onCollectionsChange,
}: CollectionSectionProps) {
  const isOwner = collection.user.id === currentUserId;
  const [showColModal, setShowColModal] = useState(false);
  const [bidToEdit, setBidToEdit] = useState<Bid | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Create a mutable reference to the collection that we can modify
  const [workingCollection, setWorkingCollection] = useState<Collection>(collection);
  
  // Update working collection when prop changes
  useState(() => {
    setWorkingCollection(collection);
  });

  const { deleteCollection } = useDeleteCollection()
  const { acceptBid } = useAcceptBid()
  const { rejectBid } = useRejectBid()
  const { cancelBid } = useCancelBid()

  const bids = workingCollection.bids || [];
  
  const userPendingBid = bids.find(bid => 
    bid.userId === currentUserId && bid.status === 'PENDING'
  );

  const forceRerender = () => {
    setForceUpdate(prev => prev + 1);
  };

  const updateWorkingBid = (bidId: number, updates: Partial<Bid>) => {
    setWorkingCollection(prev => ({
      ...prev,
      bids: prev.bids.map(bid => 
        bid.id === bidId ? { ...bid, ...updates } : bid
      )
    }));
    forceRerender();
  };

  const removeWorkingBid = (bidId: number) => {
    setWorkingCollection(prev => ({
      ...prev,
      bids: prev.bids.filter(bid => bid.id !== bidId)
    }));
    forceRerender();
  };

  const addWorkingBid = (newBid: Bid) => {
    setWorkingCollection(prev => ({
      ...prev,
      bids: [...prev.bids, newBid]
    }));
    forceRerender();
  };

  const updateWorkingCollection = (updates: Partial<Collection>) => {
    setWorkingCollection(prev => ({ ...prev, ...updates }));
    forceRerender();
  };

  const handleDeleteCol = async () => {
    
    try {
      await deleteCollection(collection.id.toString());
      onCollectionsChange();
    } catch (e) {
    }
  };

  const handleAccept = async (bidId: number) => {
    
    // Immediate UI update - accept this bid and reject all other PENDING bids
    setWorkingCollection(prev => ({
      ...prev,
      bids: prev.bids.map(bid => {
        if (bid.id === bidId) {
          return { ...bid, status: 'ACCEPTED' as const };
        } else if (bid.status === 'PENDING') {
          return { ...bid, status: 'REJECTED' as const };
        }
        return bid;
      })
    }));
    forceRerender();
    
    try {
      await acceptBid(collection.id.toString(), bidId);
    } catch (e) {
      setWorkingCollection(collection);
      forceRerender();
    }
  };
  
  const handleReject = async (bidId: number) => {
    
    // Immediate UI update - only reject this specific bid
    setWorkingCollection(prev => {
      const updatedCollection = {
        ...prev,
        bids: prev.bids.map(bid => {
          if (bid.id === bidId) {
            return { ...bid, status: 'REJECTED' as const };
          }
          return bid;
        })
      };
      
      return updatedCollection;
    });
    forceRerender();
    
    try {
      await rejectBid(collection.id.toString(), bidId);
    } catch (e) {
      // Revert on error
      setWorkingCollection(collection);
      forceRerender();
    }
  };
  
  const handleCancelBid = async (bidId: number) => {
    
    const originalCollection = { ...workingCollection };
    removeWorkingBid(bidId);
    
    try {
      await cancelBid(bidId);
    } catch (e) {
      setWorkingCollection(originalCollection);
      forceRerender();
    }
  };

  const handleBidSuccess = (newBid?: Bid, updatedBidData?: Partial<Bid>) => {
    if (newBid && !bidToEdit) {
      // New bid
      addWorkingBid(newBid);
    } else if (updatedBidData && bidToEdit) {
      // Edit existing bid
      updateWorkingBid(bidToEdit.id, updatedBidData);
    }
    
    setShowBidModal(false);
  };

  const handleCollectionSuccess = (updatedData?: Collection | Partial<Collection>) => {
    if (updatedData) {
      updateWorkingCollection(updatedData);
    } else {
      onCollectionsChange();
    }
    setShowColModal(false);
  };

  return (
    <section className="p-6 border rounded-lg bg-white shadow" key={`${collection.id}-${forceUpdate}`}>
      {/* Debug info */}
      <div className="mb-2 p-2 bg-yellow-50 rounded text-xs text-gray-600">
        🔍 Collection #{collection.id} | Bids: {bids.length} | Update: {forceUpdate}
      </div>
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{workingCollection.name}</h2>
          <p className="text-gray-600 mt-1">{workingCollection.description}</p>
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            <p>Stocks: {workingCollection.stocks} | Price: R$ {workingCollection.price.toFixed(2)}</p>
            <p>Owner: {workingCollection.user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {isOwner ? (
            <>
              <button
                onClick={() => setShowColModal(true)}
                className="p-2 hover:bg-gray-100 rounded border"
                title="Edit collection"
              >
                ✏️
              </button>
              <button
                onClick={handleDeleteCol}
                className="p-2 hover:bg-gray-100 rounded border"
                title="Delete collection"
              >
                🗑️
              </button>
            </>
          ) : userPendingBid ? (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setBidToEdit(userPendingBid);
                  setShowBidModal(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                title="Edit your pending bid"
              >
                ✏️ Edit Bid
              </button>
              <button
                onClick={() => handleCancelBid(userPendingBid.id)}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                title="Cancel your pending bid"
              >
                🗑️ Cancel Bid
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setBidToEdit(null);
                setShowBidModal(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Place Bid
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-700">Bids ({bids.length})</h3>
        {bids.length === 0 ? (
          <p className="text-sm italic text-gray-500">No bids yet</p>
        ) : (
          <div className="space-y-3">
            {bids.map((bid, index) => (
              <div key={`${bid.id}-${bid.status}-${bid.price}-${forceUpdate}-${index}`}>
                <BidItem
                  bid={bid}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onAccept={() => handleAccept(bid.id)}
                  onReject={() => handleReject(bid.id)}
                  onEdit={() => {
                    setBidToEdit(bid);
                    setShowBidModal(true);
                  }}
                  onCancel={() => handleCancelBid(bid.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showBidModal && (
        <BidModal
          collectionId={collection.id.toString()}
          initialData={bidToEdit}
          onClose={() => {
            setShowBidModal(false);
          }}
          onSuccess={handleBidSuccess}
        />
      )}

      {showColModal && (
        <CollectionModal
          initialData={workingCollection}
          onClose={() => setShowColModal(false)}
          onSuccess={handleCollectionSuccess}
        />
      )}
    </section>
  );
}