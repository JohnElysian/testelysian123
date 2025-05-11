import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Eye, Star, BarChart3 } from 'lucide-react';
import MetricCard from './MetricCard';
import TikTokConnection from '../../utils/TikTokConnection';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  width: 100%;
`;

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    viewers: 0,
    diamonds: 0,
    likes: 0
  });
  
  useEffect(() => {
    // Update viewer count
    const handleRoomUser = (data) => {
      if (data && data.viewerCount != null) {
        setMetrics(prev => ({ ...prev, viewers: data.viewerCount }));
      }
    };
    
    // Update like count
    const handleLike = (data) => {
      if (data?.totalLikeCount != null) {
        setMetrics(prev => ({ ...prev, likes: data.totalLikeCount }));
      } else if (data?.likeCount != null) {
        setMetrics(prev => ({ ...prev, likes: prev.likes + data.likeCount }));
      }
    };
    
    // Update diamond count
    const handleGift = (data) => {
      if (data?.repeatEnd) {
        const diamonds = (data.diamondCount || 0) * (data.repeatCount || 1);
        setMetrics(prev => ({ ...prev, diamonds: prev.diamonds + diamonds }));
      }
    };
    
    // Room stats unified event
    const handleRoomStats = (stats) => {
      const updates = {};
      
      if (stats.viewerCount != null) updates.viewers = stats.viewerCount;
      if (stats.likeCount != null) updates.likes = stats.likeCount;
      if (stats.diamondCount != null) updates.diamonds = stats.diamondCount;
      
      if (Object.keys(updates).length > 0) {
        setMetrics(prev => ({ ...prev, ...updates }));
      }
    };
    
    TikTokConnection.on('roomUser', handleRoomUser);
    TikTokConnection.on('like', handleLike);
    TikTokConnection.on('gift', handleGift);
    TikTokConnection.on('roomStats', handleRoomStats);
    
    return () => {
      TikTokConnection.off('roomUser', handleRoomUser);
      TikTokConnection.off('like', handleLike);
      TikTokConnection.off('gift', handleGift);
      TikTokConnection.off('roomStats', handleRoomStats);
    };
  }, []);

  const metricItems = [
    {
      icon: <Eye size={24} />,
      value: metrics.viewers,
      label: 'Viewers',
      color: '#8b5cf6'
    },
    {
      icon: <Star size={24} />,
      value: metrics.diamonds,
      label: 'Diamonds',
      color: '#8b5cf6'
    },
    {
      icon: <BarChart3 size={24} />,
      value: metrics.likes,
      label: 'Likes',
      color: '#8b5cf6'
    }
  ];

  return (
    <DashboardContainer>
      {metricItems.map((metric, index) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          value={metric.value.toLocaleString()}
          label={metric.label}
          color={metric.color}
          delay={index * 0.1}
        />
      ))}
    </DashboardContainer>
  );
};

export default Dashboard; 