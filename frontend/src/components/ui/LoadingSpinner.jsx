import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ $padding }) => $padding || '48px'};
`;

const SpinnerRing = styled.div`
  width: ${({ $size }) => $size || '40px'};
  height: ${({ $size }) => $size || '40px'};
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export function LoadingSpinner({ size, padding }) {
  return (
    <SpinnerWrapper $padding={padding}>
      <SpinnerRing $size={size} />
    </SpinnerWrapper>
  );
}

const SkeletonBlock = styled.div`
  height: ${({ $height }) => $height || '16px'};
  width: ${({ $width }) => $width || '100%'};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.bgElevated} 25%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.bgElevated} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

export function Skeleton({ height, width, className }) {
  return <SkeletonBlock $height={height} $width={width} className={className} />;
}

const FullPageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

export function FullPageSpinner() {
  return (
    <FullPageWrapper>
      <SpinnerRing $size="48px" />
    </FullPageWrapper>
  );
}

export default LoadingSpinner;
