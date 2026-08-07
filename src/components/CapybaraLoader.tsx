import React from 'react';
import './CapybaraLoader.css';

interface CapybaraLoaderProps {
  caption?: string;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const CapybaraLoader: React.FC<CapybaraLoaderProps> = ({
  caption,
  scale = 0.75,
  className = '',
  style = {}
}) => {
  return (
    <div className={`capybaraloader-container ${className}`} style={style}>
      <div className="capybaraloader" style={{ transform: `scale(${scale})` }}>
        <div className="capybara">
          <div className="capyhead">
            <div className="capyear">
              <div className="capyear2"></div>
            </div>
            <div className="capyear"></div>
            <div className="capymouth">
              <div className="capylips"></div>
              <div className="capylips"></div>
            </div>
            <div className="capyeye"></div>
            <div className="capyeye"></div>
          </div>
          <div className="capyleg"></div>
          <div className="capyleg2"></div>
          <div className="capyleg2"></div>
          <div className="capy"></div>
        </div>
        <div className="loader">
          <div className="loaderline"></div>
        </div>
      </div>
      {caption && <div className="capybaraloader-caption">{caption}</div>}
    </div>
  );
};
