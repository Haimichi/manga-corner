import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  paginate, 
  totalItems,
  itemsPerPage,
  showItemsCount = true
}) => {
  if (totalPages <= 1) return null;
  
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentPage === 1 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Trang trước
          </button>
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`ml-3 px-4 py-2 rounded-md text-sm font-medium ${
              currentPage === totalPages 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Trang sau
          </button>
        </div>
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          {showItemsCount && (
            <div>
              <p className="text-sm text-gray-400">
                Hiển thị <span className="font-medium">{indexOfFirstItem}</span> đến <span className="font-medium">{indexOfLastItem}</span> trong tổng số <span className="font-medium">{totalItems}</span> mục
              </p>
            </div>
          )}
          
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {/* Nút Trang trước */}
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                  currentPage === 1 
                    ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="sr-only">Trang trước</span>
                <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              
              {/* Hiển thị số trang */}
              {generatePaginationItems(currentPage, totalPages).map((item, index) => {
                if (item === '...') {
                  return (
                    <span 
                      key={`ellipsis-${index}`}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-700 bg-gray-800 text-gray-500"
                    >
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={item}
                    onClick={() => paginate(item)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === item
                        ? 'border-blue-600 bg-blue-700 text-white font-medium z-10'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
              
              {/* Nút Trang sau */}
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                  currentPage === totalPages 
                    ? 'border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="sr-only">Trang sau</span>
                <FaChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hàm tạo mảng các trang hiển thị
function generatePaginationItems(currentPage, totalPages) {
  const items = [];
  
  // Hiển thị tối đa 7 trang:
  // 1 ... 4 5 6 ... 10 (khi ở trang 5 và có 10 trang)
  
  if (totalPages <= 7) {
    // Hiển thị tất cả các trang nếu tổng số trang <= 7
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Luôn hiển thị trang 1
    items.push(1);
    
    if (currentPage > 3) {
      items.push('...');
    }
    
    // Tính toán phạm vi trang hiển thị xung quanh trang hiện tại
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      items.push('...');
    }
    
    // Luôn hiển thị trang cuối cùng
    items.push(totalPages);
  }
  
  return items;
}

export default Pagination; 