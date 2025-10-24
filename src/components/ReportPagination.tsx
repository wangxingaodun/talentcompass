import React from 'react';
import './ReportPagination.css';

interface ReportPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageNames: string[];
}

const ReportPagination: React.FC<ReportPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageNames
}) => {
  return (
    <div className="report-pagination">
      {/* 页面指示器 */}
      <div className="pagination-indicators">
        {Array.from({ length: totalPages }, (_, index) => (
          <div
            key={index}
            className={`page-indicator ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => onPageChange(index + 1)}
            title={pageNames[index]}
          />
        ))}
      </div>
      
      {/* 导航按钮 */}
      <div className="pagination-controls">
        <button
          className="pagination-btn prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="icon">←</span>
          上一页
        </button>
        
        <div className="page-info">
          第 {currentPage} 页 / 共 {totalPages} 页
          <span className="page-name">{pageNames[currentPage - 1]}</span>
        </div>
        
        <button
          className="pagination-btn next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          下一页
          <span className="icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default ReportPagination;