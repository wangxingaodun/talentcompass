import React, { useState } from 'react';
import ReportPagination from './ReportPagination';
import ReportPage1 from './ReportPage1';
import ReportPage2 from './ReportPage2';
import StoryReportPage from './StoryReportPage';
import ReportPage3 from './ReportPage3';
import type { ImaginationAssessment } from './games/types';

interface ReportPageProps {
  childName: string;
  testDate: string;
  scores: {
    expression: number;
    logic: number;
    creativity: number;
    imagination: number;
    reaction: number;
  };
  talentType: string;
  talentDescription: string;
  tips: string[];
  resources: {
    name: string;
    url: string;
  }[];
  imaginationAssessment?: ImaginationAssessment;
  storyAssessment?: StoryAssessment;
}

const ReportPage: React.FC<ReportPageProps> = ({
  childName,
  testDate,
  scores,
  talentType,
  talentDescription,
  tips,
  resources,
  imaginationAssessment,
  storyAssessment
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;
  const pageNames = ['天赋概览', '创意分析', '故事分析', '成长指导'];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    const pageStyle = {
      opacity: 1,
      transform: 'translateX(0)',
      transition: 'opacity 0.4s ease, transform 0.4s ease'
    } as React.CSSProperties;

    switch (currentPage) {
      case 1:
        return (
          <div style={pageStyle}>
            <ReportPage1
              childName={childName}
              testDate={testDate}
              scores={scores}
              talentType={talentType}
              talentDescription={talentDescription}
            />
          </div>
        );
      case 2:
        return (
          <div style={pageStyle}>
            <ReportPage2
              childName={childName}
              imaginationAssessment={imaginationAssessment}
            />
          </div>
        );
      case 3:
        return (
          <div style={pageStyle}>
            <StoryReportPage
              childName={childName}
              storyAssessment={storyAssessment}
            />
          </div>
        );
      case 4:
        return (
          <div style={pageStyle}>
            <ReportPage3
              childName={childName}
              scores={scores}
              imaginationAssessment={imaginationAssessment}
              talentType={talentType}
              tips={tips}
              resources={resources}
            />
          </div>
        );
      default:
        return (
          <div style={pageStyle}>
            <ReportPage1
              childName={childName}
              testDate={testDate}
              scores={scores}
              talentType={talentType}
              talentDescription={talentDescription}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="report-page">
      <div className="report-container">
        {/* 页面内容 */}
        <div className="report-content">
          {renderCurrentPage()}
        </div>
        
        {/* 分页导航 */}
        <ReportPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageNames={pageNames}
        />
      </div>
    </div>
  );
};

export default ReportPage;