import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getUserAchievements } from '../../services/api';

const Widget = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const BadgeTitle = styled.h4`
  color: #14532d;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  border-bottom: 2px solid #dcfce7;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
`;

const Count = styled.span`
  font-size: 0.9rem;
  color: #888;
  font-weight: 600;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  flex: 1;
  align-content: start;
`;

const BadgeItem = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  padding: 10px 8px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  min-height: 110px;
  max-height: 110px;
  overflow: visible;
  transition: transform 0.2s, background 0.2s, opacity 0.2s;
  opacity: ${props => props.$isEarned ? 1 : 0.5};
  filter: ${props => props.$isEarned ? 'none' : 'grayscale(50%)'};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.$isEarned ? '#edfdf5' : '#f0fdf4'};
  }
`;

const BadgeIcon = styled.span`
  font-size: 1.8rem;
  margin-bottom: 4px;
`;

const BadgeName = styled.span`
  font-size: 0.76rem;
  font-weight: 700;
  color: #374151;
  line-height: 1.15;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 2px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #23da63, #14532d);
  width: ${props => `${props.$progress || 0}%`};
  transition: width 0.3s ease;
`;

const ProgressInfo = styled.span`
  font-size: 0.65rem;
  color: #666;
  font-weight: 500;
`;

const EmptyText = styled.p`
  grid-column: 1 / -1;
  text-align: center;
  color: #999;
  margin-top: 30px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
`;

const PageBtn = styled.button`
  background: #f0fdf4;
  border: 1px solid #4ade80;
  color: #14532d;
  padding: 5px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #ddd;
    background: #eee;
  }
`;

const PageInfo = styled.span`
  align-self: center;
  font-size: 0.9rem;
`;

const Tooltip = styled.div`
  position: absolute;
  left: 50%;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  min-width: 180px;
  max-width: 240px;
  background: #111827;
  color: #ffffff;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 0.75rem;
  line-height: 1.3;
  z-index: 20;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;

  ${BadgeItem}:hover & {
    opacity: 1;
  }
`;

const TOOLTIP_DESCRIPTIONS = {
  first_win_online: 'Unlocks when you win your first online match.',
  speedster_easy: 'Unlocks when you finish Easy in 2 minutes or less.',
  speedster_medium: 'Unlocks when you finish Medium in 4 minutes or less.',
  speedster_hard: 'Unlocks when you finish Hard in 6 minutes or less.',
  speedster_expert: 'Unlocks when you finish Expert in 8 minutes or less.',
  speedster_extreme: 'Unlocks when you finish Extreme in 10 minutes or less.',
  on_fire_5x: 'Unlocks when you reach a 5-win streak.',
  on_fire_10x: 'Unlocks when you reach a 10-win streak.',
  on_fire_25x: 'Unlocks when you reach a 25-win streak.',
  graduate_offline: 'Unlocks with 20+ wins in all difficulties in Offline mode.',
  graduate_online: 'Unlocks with 20+ wins in all difficulties in Online mode.',
  star: 'Unlocks when you enter Top 50 in the online leaderboard.',
  king_easy: 'Unlocks by reaching Rank #1 on Easy leaderboard.',
  king_medium: 'Unlocks by reaching Rank #1 on Medium leaderboard.',
  king_hard: 'Unlocks by reaching Rank #1 on Hard leaderboard.',
  king_expert: 'Unlocks by reaching Rank #1 on Expert leaderboard.',
  king_extreme: 'Unlocks by reaching Rank #1 on Extreme leaderboard.'
};

const COMPACT_NAMES = {
  first_win_online: 'First Win',
  speedster_easy: 'Speedster I',
  speedster_medium: 'Speedster II',
  speedster_hard: 'Speedster III',
  speedster_expert: 'Speedster IV',
  speedster_extreme: 'Speedster V',
  on_fire_5x: 'Win Streak I',
  on_fire_10x: 'Win Streak II',
  on_fire_25x: 'Win Streak III',
  graduate_offline: 'Graduate Offline',
  graduate_online: 'Graduate Online',
  star: 'Star',
  king_easy: 'King I',
  king_medium: 'King II',
  king_hard: 'King III',
  king_expert: 'King IV',
  king_extreme: 'King V'
};

const ALL_ACHIEVEMENTS = [
  { type: 'first_win_online', name: 'First Win', icon: '🥇', description: TOOLTIP_DESCRIPTIONS.first_win_online, target: 1 },
  { type: 'speedster_easy', name: 'Speedster I', icon: '⚡', description: TOOLTIP_DESCRIPTIONS.speedster_easy, target: 1 },
  { type: 'speedster_medium', name: 'Speedster II', icon: '⚡', description: TOOLTIP_DESCRIPTIONS.speedster_medium, target: 1 },
  { type: 'speedster_hard', name: 'Speedster III', icon: '⚡', description: TOOLTIP_DESCRIPTIONS.speedster_hard, target: 1 },
  { type: 'speedster_expert', name: 'Speedster IV', icon: '⚡', description: TOOLTIP_DESCRIPTIONS.speedster_expert, target: 1 },
  { type: 'speedster_extreme', name: 'Speedster V', icon: '⚡', description: TOOLTIP_DESCRIPTIONS.speedster_extreme, target: 1 },
  { type: 'on_fire_5x', name: 'Win Streak I', icon: '🔥', description: TOOLTIP_DESCRIPTIONS.on_fire_5x, target: 5 },
  { type: 'on_fire_10x', name: 'Win Streak II', icon: '🔥', description: TOOLTIP_DESCRIPTIONS.on_fire_10x, target: 10 },
  { type: 'on_fire_25x', name: 'Win Streak III', icon: '🔥', description: TOOLTIP_DESCRIPTIONS.on_fire_25x, target: 25 },
  { type: 'graduate_offline', name: 'Graduate Offline', icon: '🎓', description: TOOLTIP_DESCRIPTIONS.graduate_offline, target: 5 },
  { type: 'graduate_online', name: 'Graduate Online', icon: '🎓', description: TOOLTIP_DESCRIPTIONS.graduate_online, target: 5 },
  { type: 'star', name: 'Star', icon: '⭐', description: TOOLTIP_DESCRIPTIONS.star, target: 50 },
  { type: 'king_easy', name: 'King I', icon: '👑', description: TOOLTIP_DESCRIPTIONS.king_easy, target: 1 },
  { type: 'king_medium', name: 'King II', icon: '👑', description: TOOLTIP_DESCRIPTIONS.king_medium, target: 1 },
  { type: 'king_hard', name: 'King III', icon: '👑', description: TOOLTIP_DESCRIPTIONS.king_hard, target: 1 },
  { type: 'king_expert', name: 'King IV', icon: '👑', description: TOOLTIP_DESCRIPTIONS.king_expert, target: 1 },
  { type: 'king_extreme', name: 'King V', icon: '👑', description: TOOLTIP_DESCRIPTIONS.king_extreme, target: 1 }
];

const isAchievementEarned = (achievement) => {
  const hasId = achievement?.id !== null && achievement?.id !== undefined;
  const hasEarnedDate = typeof achievement?.earned_at === 'string'
    ? achievement.earned_at.trim() !== '' && achievement.earned_at.trim().toLowerCase() !== 'null'
    : achievement?.earned_at !== null && achievement?.earned_at !== undefined;
  return hasId || hasEarnedDate;
};

const BadgeWidget = ({ username, userId = null }) => {
  const [allAchievements, setAllAchievements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchAchievements = async () => {
      if (username) {
        try {
          const response = await getUserAchievements(username, userId);
          const apiAchievements = Array.isArray(response) ? response : (response.achievements || []);
          const apiMap = new Map(apiAchievements.map(item => [item.type, item]));

          const mergedAchievements = ALL_ACHIEVEMENTS.map(base => {
            const apiItem = apiMap.get(base.type);
            if (!apiItem) {
              return {
                ...base,
                id: null,
                earned_at: null,
                progress: 0,
                target: base.target
              };
            }

            return {
              ...base,
              ...apiItem,
              target: apiItem.target ?? base.target,
              progress: apiItem.progress ?? 0
            };
          });

          mergedAchievements.sort((a, b) => {
            const aEarned = isAchievementEarned(a);
            const bEarned = isAchievementEarned(b);
            if (aEarned !== bEarned)
              return aEarned ? -1 : 1;
            return (a.name || '').localeCompare(b.name || '');
          });

          setAllAchievements(mergedAchievements);
        } catch (error) {
          console.error('Error fetching achievements:', error);
          setAllAchievements(ALL_ACHIEVEMENTS.map(item => ({
            ...item,
            id: null,
            earned_at: null,
            progress: 0
          })));
        }
      }
    };

    fetchAchievements();
  }, [username, userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [username, allAchievements.length]);

  const totalPages = Math.ceil(allAchievements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBadges = allAchievements.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages)
      setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1)
      setCurrentPage(prev => prev - 1);
  };

  const calculateProgressPercentage = (achievement) => {
    if (!achievement.target || achievement.target === 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round((achievement.progress / achievement.target) * 100)));
  };

  const earnedCount = allAchievements.filter(isAchievementEarned).length;

  return (
    <Widget>
      <BadgeTitle>
        Achievements
        <Count>({earnedCount}/{allAchievements.length})</Count>
      </BadgeTitle>

      <BadgeGrid>
        {currentBadges.length > 0 ? (
          currentBadges.map(badge => {
            const isEarned = isAchievementEarned(badge);
            const earnedDate = isEarned ? new Date(badge.earned_at).toLocaleDateString() : '-';
            const unlockInfo = TOOLTIP_DESCRIPTIONS[badge.type] || badge.description || 'Achievement unlocked.';
            const compactName = COMPACT_NAMES[badge.type] || badge.name;
            const progressPercentage = calculateProgressPercentage(badge);

            return (
              <BadgeItem key={badge.type} $isEarned={isEarned}>
                <BadgeIcon>{badge.icon}</BadgeIcon>
                <BadgeName>{compactName}</BadgeName>
                {!isEarned && (
                  <>
                    <ProgressBarContainer>
                      <ProgressBar $progress={progressPercentage} />
                    </ProgressBarContainer>
                    <ProgressInfo>{progressPercentage}%</ProgressInfo>
                  </>
                )}
                <Tooltip>
                  <strong>{compactName}</strong><br />
                  {unlockInfo}<br />
                  {isEarned ? `Earned: ${earnedDate}` : `Progress: ${badge.progress}/${badge.target}`}
                </Tooltip>
              </BadgeItem>
            );
          })
        ) : (
          <EmptyText>
            No achievements available
          </EmptyText>
        )}
      </BadgeGrid>

      {totalPages > 1 && (
        <Pagination>
          <PageBtn onClick={handlePrev} disabled={currentPage === 1}>
            &lt; Prev
          </PageBtn>
          <PageInfo>
            {currentPage} / {totalPages}
          </PageInfo>
          <PageBtn onClick={handleNext} disabled={currentPage === totalPages}>
            Next &gt;
          </PageBtn>
        </Pagination>
      )}
    </Widget>
  );
};

export default BadgeWidget;