<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElInput, ElButton, ElTag, ElDivider, ElMessage } from 'element-plus';
import { analyzeTaskDescription, type TaskSuggestion, type AnalysisResult } from '../services/TaskAnalysisService';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '输入任务描述'
  }
});

const emit = defineEmits(['update:modelValue', 'analyze']);

const inputValue = ref(props.modelValue);
const suggestions = ref<TaskSuggestion[]>([]);
const analysisResult = ref<AnalysisResult | null>(null);
const isAnalyzing = ref(false);

// 监听输入值变化
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal;
});

// 更新输入值
const updateValue = (val: string) => {
  inputValue.value = val;
  emit('update:modelValue', val);
};

// 智能分析
const analyzeInput = async () => {
  if (!inputValue.value.trim()) {
    ElMessage.warning('请输入任务描述');
    return;
  }
  
  isAnalyzing.value = true;
  
  try {
    // 调用任务分析服务
    const result = await analyzeTaskDescription(inputValue.value.trim());
    
    if (!result) {
      ElMessage.error('分析结果为空，请重试');
      return;
    }
    
    suggestions.value = result.suggestions || [];
    analysisResult.value = result;
    
    // 触发分析完成事件
    emit('analyze', result);
  } catch (error) {
    console.error('任务分析失败:', error);
    ElMessage.error('任务分析失败，请重试');
  } finally {
    isAnalyzing.value = false;
  }
};

// 应用建议
const applySuggestion = (suggestion: TaskSuggestion) => {
  updateValue(inputValue.value + ' ' + suggestion.text);
};

// 获取标签类型
const getTagType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  switch (type) {
    case 'keyword': return 'success';
    case 'action': return 'warning';
    case 'dependency': return 'info';
    default: return 'primary';
  }
};

// 获取复杂度标签类型
const getComplexityTagType = (complexity?: 'low' | 'medium' | 'high'): 'primary' | 'success' | 'warning' | 'danger' => {
  switch (complexity) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    default: return 'primary';
  }
};

// 获取复杂度文本
const getComplexityText = (complexity?: 'low' | 'medium' | 'high'): string => {
  switch (complexity) {
    case 'low': return '低';
    case 'medium': return '中';
    case 'high': return '高';
    default: return '未知';
  }
};
</script>

<template>
  <div class="smart-input-container">
    <div class="input-area">
      <el-input
        v-model="inputValue"
        :placeholder="placeholder"
        type="textarea"
        :rows="4"
        @update:modelValue="updateValue"
      />
      <el-button 
        type="primary" 
        @click="analyzeInput"
        :loading="isAnalyzing"
        :disabled="!inputValue.trim()"
      >
        智能分析
      </el-button>
    </div>
    
    <div v-if="analysisResult" class="suggestions-area">
      <div class="suggestions-title">智能分析结果:</div>
      
      <!-- 建议标签 -->
      <div class="suggestions-list">
        <el-tag
          v-for="(suggestion, index) in suggestions"
          :key="index"
          :type="getTagType(suggestion.type)"
          class="suggestion-tag"
          @click="applySuggestion(suggestion)"
        >
          {{ suggestion.text }}
          <span class="confidence">({{ Math.round(suggestion.confidence * 100) }}%)</span>
        </el-tag>
      </div>
      
      <el-divider></el-divider>
      
      <!-- 分析详情 -->
      <div class="analysis-details">
        <div class="detail-item">
          <span class="detail-label">预估时间:</span>
          <span class="detail-value">{{ analysisResult.estimatedTime }} 分钟</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">复杂度:</span>
          <span class="detail-value">
            <el-tag size="small" :type="getComplexityTagType(analysisResult.complexity)">
              {{ getComplexityText(analysisResult.complexity) }}
            </el-tag>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-input-container {
  margin-bottom: 15px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.suggestions-area {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.suggestions-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: bold;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.suggestion-tag {
  cursor: pointer;
  transition: transform 0.2s;
}

.suggestion-tag:hover {
  transform: translateY(-2px);
}

.confidence {
  font-size: 11px;
  opacity: 0.8;
  margin-left: 4px;
}

.analysis-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-label {
  font-size: 13px;
  color: #606266;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
}
</style>