'use client';

import React, { useState, useEffect } from 'react';
import { GithubOutlined, StarOutlined, EyeOutlined, ForkOutlined } from '@ant-design/icons';
import { Card, Skeleton, Typography, Space, Tag } from 'antd';

const { Text, Link } = Typography;

interface GitHubRepoData {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface GitHubRepoCardProps {
  url: string;
  children?: React.ReactNode;
}

export default function GitHubRepoCard({ url, children }: GitHubRepoCardProps) {
  const [repoData, setRepoData] = useState<GitHubRepoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 从URL中提取owner和repo名称
  const extractRepoInfo = (githubUrl: string) => {
    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/\?#]+)/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }
    } catch (e) {
      console.error('Failed to extract repo info:', e);
    }
    return null;
  };

  useEffect(() => {
    const fetchRepoData = async () => {
      const repoInfo = extractRepoInfo(url);
      if (!repoInfo) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        // 使用GitHub API获取仓库信息
        const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch repo data');
        }

        const data: GitHubRepoData = await response.json();
        setRepoData(data);
      } catch (err) {
        console.error('Error fetching GitHub repo data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [url]);

  // 格式化数字显示
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  // 获取语言颜色
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Dart': '#00B4AB',
      'Shell': '#89e051',
      'HTML': '#e34c26',
      'CSS': '#1572B6',
      'Vue': '#4FC08D',
      'React': '#61DAFB',
    };
    return colors[language] || '#858585';
  };

  if (loading) {
    return (
      <Card className="my-4 border border-gray-200 dark:border-gray-700">
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  if (error || !repoData) {
    // 如果获取失败，显示普通链接
    return (
      <Link href={url} target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
        {children || url}
      </Link>
    );
  }

  return (
    <Card 
      className="my-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
      styles={{ body: { padding: '16px' } }}
      hoverable
    >
      <div className="flex items-start gap-3">
        {/* GitHub图标 */}
        <div className="flex-shrink-0 mt-1">
          <GithubOutlined className="text-xl text-gray-700 dark:text-gray-300" />
        </div>

        {/* 仓库信息 */}
        <div className="flex-1 min-w-0">
          {/* 仓库名称和链接 */}
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={repoData.html_url} 
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-base"
            >
              {repoData.full_name}
            </Link>
          </div>

          {/* 描述 */}
          {repoData.description && (
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3 block leading-relaxed">
              {repoData.description}
            </Text>
          )}

          {/* 标签和主题 */}
          {repoData.topics && repoData.topics.length > 0 && (
            <div className="mb-3">
              <Space wrap size={[4, 4]}>
                {repoData.topics.slice(0, 5).map((topic) => (
                  <Tag 
                    key={topic} 
                    color="blue" 
                    className="text-xs"
                  >
                    {topic}
                  </Tag>
                ))}
                {repoData.topics.length > 5 && (
                  <Tag className="text-xs">
                    +{repoData.topics.length - 5}
                  </Tag>
                )}
              </Space>
            </div>
          )}

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {/* 编程语言 */}
            {repoData.language && (
              <div className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(repoData.language) }}
                />
                <span>{repoData.language}</span>
              </div>
            )}

            {/* Star数 */}
            <div className="flex items-center gap-1">
              <StarOutlined />
              <span>{formatNumber(repoData.stargazers_count)}</span>
            </div>

            {/* Fork数 */}
            <div className="flex items-center gap-1">
              <ForkOutlined />
              <span>{formatNumber(repoData.forks_count)}</span>
            </div>

            {/* 更新时间 */}
            <span className="text-xs">
              Updated {new Date(repoData.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
