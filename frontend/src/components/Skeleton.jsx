import React from 'react';

/**
 * Industrial Brutalism Skeleton Loaders
 */
const Skeleton = ({ width, height, style = {}, className = '' }) => (
  <div
    className={`skeleton-loader ${className}`}
    style={{
      width: width || '100%',
      height: height || '18px',
      ...style,
    }}
  />
);

export const CardSkeleton = () => (
  <div className="card-skeleton">
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <Skeleton width="120px" height="24px" />
      <Skeleton width="70px" height="24px" />
    </div>
    <Skeleton width="85%" height="32px" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Skeleton width="100%" height="14px" />
      <Skeleton width="90%" height="14px" />
      <Skeleton width="70%" height="14px" />
    </div>
    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
      <Skeleton width="60px" height="26px" />
      <Skeleton width="80px" height="26px" />
      <Skeleton width="50px" height="26px" />
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '3px solid var(--ink)',
        paddingTop: 14,
        marginTop: 4,
      }}
    >
      <Skeleton width="80px" height="32px" />
      <Skeleton width="100px" height="40px" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} height="15px" />
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card-skeleton" style={{ padding: 24, gap: 12 }}>
    <Skeleton width="80px" height="12px" />
    <Skeleton width="140px" height="56px" />
    <Skeleton width="100px" height="12px" />
  </div>
);

export const JobRowSkeleton = () => (
  <div style={{ padding: '24px 0', borderBottom: '3px solid var(--ink)', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <Skeleton width="110px" height="12px" />
    <Skeleton width="65%" height="28px" />
    <Skeleton width="50%" height="14px" />
    <Skeleton width="100%" height="14px" />
    <Skeleton width="80%" height="14px" />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
      <Skeleton width="120px" height="20px" />
      <Skeleton width="110px" height="40px" />
    </div>
  </div>
);

export default Skeleton;
