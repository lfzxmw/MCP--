/**
 * 任务分析服务
 * 模拟与后端API的交互，提供任务分析功能
 */

// 任务建议类型
export interface TaskSuggestion {
  text: string;
  type: 'keyword' | 'action' | 'dependency';
  confidence: number;
}

// 分析结果接口
export interface AnalysisResult {
  suggestions: TaskSuggestion[];
  estimatedTime?: number; // 预估完成时间（分钟）
  complexity?: 'low' | 'medium' | 'high'; // 任务复杂度
  dependencies?: string[]; // 依赖的其他任务
}

/**
 * 分析任务描述
 * @param description 任务描述文本
 * @returns 分析结果
 */
export const analyzeTaskDescription = async (description: string): Promise<AnalysisResult> => {
  // 检查描述是否为空
  if (!description || description.trim() === '') {
    return {
      suggestions: [],
      estimatedTime: 0,
      complexity: 'low',
      dependencies: []
    };
  }
  
  // 模拟API调用延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 这里是模拟的智能分析结果
      // 实际项目中，这里应该调用后端API进行分析
      
      // 提取关键词
      const words = description.split(/\s+/).filter(word => word.length > 2);
      
      // 生成建议
      const suggestions: TaskSuggestion[] = words.map(word => {
        return {
          text: word,
          type: getRandomSuggestionType(),
          confidence: Math.random() * 0.5 + 0.5 // 0.5-1.0之间的随机值
        };
      });
      
      // 添加一些预定义的动作建议
      const actionSuggestions: TaskSuggestion[] = [
        { text: '设计', type: 'action', confidence: 0.9 },
        { text: '开发', type: 'action', confidence: 0.85 },
        { text: '测试', type: 'action', confidence: 0.8 },
        { text: '部署', type: 'action', confidence: 0.75 },
        { text: '评审', type: 'action', confidence: 0.7 }
      ];
      
      // 随机选择1-3个动作建议
      const selectedActions = actionSuggestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);
      
      // 合并建议并按置信度排序
      const allSuggestions = [...suggestions, ...selectedActions]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8); // 最多返回8个建议
      
      // 构建分析结果
      const result: AnalysisResult = {
        suggestions: allSuggestions,
        estimatedTime: Math.floor(Math.random() * 120) + 30, // 30-150分钟
        complexity: getRandomComplexity(),
        dependencies: []
      };
      
      resolve(result);
    }, 1000);
  });
};

/**
 * 获取随机建议类型
 */
function getRandomSuggestionType(): 'keyword' | 'action' | 'dependency' {
  const types: ('keyword' | 'action' | 'dependency')[] = ['keyword', 'action', 'dependency'];
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
}

/**
 * 获取随机复杂度
 */
function getRandomComplexity(): 'low' | 'medium' | 'high' {
  const complexities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
  const randomIndex = Math.floor(Math.random() * complexities.length);
  return complexities[randomIndex];
}