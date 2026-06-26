import styled from 'styled-components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS_CONFIG } from './StatusBadge';

const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 24px;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: ${({ theme }) => theme.colors.border};
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 24px;
  animation: fadeIn 0.3s ease;
  animation-delay: ${({ $index }) => $index * 0.05}s;
  animation-fill-mode: both;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

const Dot = styled.div`
  position: absolute;
  left: -20px;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  border: 3px solid ${({ theme }) => theme.colors.bgCard};
  box-shadow: 0 0 0 2px ${({ $color, theme }) => $color || theme.colors.primary};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EventTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const EventDescription = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EventTime = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EventUser = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

function getStatusColor(status) {
  const config = STATUS_CONFIG[status];
  return config ? config.color : '#A0A0A0';
}

export default function Timeline({ events = [] }) {
  if (!events.length) {
    return null;
  }

  return (
    <TimelineWrapper>
      <TimelineLine />
      {events.map((event, index) => (
        <TimelineItem key={event.id || index} $index={index}>
          <Dot $color={getStatusColor(event.status || event.statusNovo)} />
          <Content>
            <EventTitle>
              {event.titulo || event.descricao || `Status alterado para ${STATUS_CONFIG[event.statusNovo]?.label || event.statusNovo}`}
            </EventTitle>
            {event.descricao && event.titulo && (
              <EventDescription>{event.descricao}</EventDescription>
            )}
            {event.usuario && <EventUser>por {event.usuario}</EventUser>}
            <EventTime>
              {formatDate(event.createdAt || event.data)}
            </EventTime>
          </Content>
        </TimelineItem>
      ))}
    </TimelineWrapper>
  );
}
