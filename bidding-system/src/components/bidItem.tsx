'use client';
import { Bid } from '@/common/models/bid';

interface BidItemProps {
    bid: Bid;
    isOwner: boolean;
    currentUserId: string;
    onAccept: () => void;
    onReject: () => void;
    onEdit: () => void;
    onCancel: () => void;
}

export default function BidItem({ 
    bid, 
    isOwner, 
    currentUserId,
    onAccept, 
    onReject, 
    onCancel, 
    onEdit 
}: BidItemProps) {
  const isBidOwner = bid.userId === currentUserId;
  
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg">
      <div>
        <p className="font-medium">Bid #{bid.id}</p>
        <p className="font-medium text-green-600">$ {bid.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500">by {bid.user.name}</p>
        <p className={`text-sm font-medium ${
          bid.status === 'ACCEPTED' ? 'text-green-600' : 
          bid.status === 'REJECTED' ? 'text-red-600' : 
          'text-yellow-600'
        }`}>
          {bid.status}
        </p>
      </div>
      <div className="flex space-x-2">
        {isOwner && bid.status === 'PENDING' ? (
          <>
            <button
              onClick={onAccept}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
              title="Accept bid"
            >
              ✔️ Accept
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
              title="Reject bid"
            >
              ❌ Reject
            </button>
          </>
        ) : isBidOwner && bid.status === 'PENDING' ? (
          <>
            <button
              onClick={onEdit}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              title="Edit bid"
            >
              ✏️ Edit
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              title="Cancel bid"
            >
              🗑️ Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}