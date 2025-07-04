'use client';
import { useAuth } from '@/common/hooks/useAuth';
import { useContext, useState, useEffect, useMemo } from 'react';
import { UserContext } from '@/common/context/userContext';
import useCollection from '@/common/hooks/collection/useCollection';
import CollectionSection from '@/components/collectionSection';
import CollectionModal from '@/components/collectionModal';
import AuthWrapper from '@/components/authWrapper';
import Pagination from '../../ src/components/pagination';


export default function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const { user, loading: loadingUser } = useContext(UserContext);
  const { data: allCollections, loading: loadingCollections, refetch, error } = useCollection();
  const [showCreate, setShowCreate] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const pagination = useMemo(() => {
    const totalItems = allCollections?.length || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
    };
  }, [allCollections?.length, currentPage, itemsPerPage]);

  // Get current page data
  const collections = useMemo(() => {
    if (!allCollections) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allCollections.slice(startIndex, endIndex);
  }, [allCollections, currentPage, itemsPerPage]);

  // Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when collections change
  useEffect(() => {
    if (allCollections && currentPage > pagination.totalPages && pagination.totalPages > 0) {
      setCurrentPage(1);
    }
  }, [allCollections, currentPage, pagination.totalPages]);

  if (!isAuthenticated) {
    return <AuthWrapper />;
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">User not found</p>
          <button onClick={logout} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Collections</h1>
          <p className="text-sm text-gray-600">Welcome, {user.name}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            + Create Collection
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Pagination Stats */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <div className="flex items-center justify-between text-sm text-blue-800">
          <span>
            {pagination.totalItems} total collections • Page {pagination.currentPage} of {pagination.totalPages} • 
            Showing {collections.length} collections this page
          </span>
          <span className="bg-blue-200 px-2 py-1 rounded text-xs">
            📄 Frontend Pagination
          </span>
        </div>
      </div>

      {/* Debug info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        Loading: {loadingCollections ? 'YES' : 'NO'} | 
        All Collections: {allCollections?.length || 0} | 
        Page Collections: {collections?.length || 0} | 
        Error: {error ? 'YES' : 'NO'}
      </div>

      {loadingCollections ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Loading collections...</p>
          <button 
            onClick={refetch} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Force Retry
          </button>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error: {error.message}</p>
          <button 
            onClick={refetch} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      ) : !allCollections || allCollections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No collections found</p>
          <button 
            onClick={refetch} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Refresh
          </button>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No collections on this page</p>
          <button 
            onClick={() => setCurrentPage(1)} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go to First Page
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {collections.length} of {pagination.totalItems} collections
            </span>
            <button 
              onClick={refetch} 
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
            >
              Refresh
            </button>
          </div>
          {collections.map(col => (
            <CollectionSection
              key={`collection-${col.id}-page-${currentPage}`}
              collection={col}
              currentUserId={user.id}
              onCollectionsChange={refetch}
            />
          ))}
        </div>
      )}

      {/* Debug Pagination Info */}
      <div className="mt-4 p-2 bg-yellow-100 rounded text-xs">
        Should show pagination: {(!loadingCollections && !error && allCollections && allCollections.length > 0 && pagination.totalPages > 1) ? 'YES' : 'NO'} | 
        Total Pages: {pagination.totalPages} | 
        Current Page: {pagination.currentPage}
      </div>

      {/* Pagination - Only show if there are multiple pages */}
      {!loadingCollections && !error && allCollections && allCollections.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
          />
        </div>
      )}

      {showCreate && (
        <CollectionModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      )}
    </main>
  );
}