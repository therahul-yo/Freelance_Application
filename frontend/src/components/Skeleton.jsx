import React from 'react';

const Skeleton = ({ width, height, borderRadius = 0, style = {}, className = "" }) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
        ...style
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="card-static" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton width="120px" height="24px" />
      <Skeleton width="80px" height="24px" />
    </div>
    <Skeleton width="80%" height="28px" />
    <Skeleton width="100%" height="60px" />
    <div style={{ display: 'flex', gap: 10 }}>
      <Skeleton width="60px" height="30px" border="15px" />
      <Skeleton width="80px" height="30px" border="15px" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height="16px" />
    ))}
  </div>
);

export default Skeleton;
