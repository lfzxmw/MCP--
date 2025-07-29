<script setup lang="ts">
import { ref } from 'vue';
import { ElButton, ElTooltip } from 'element-plus';

const emit = defineEmits(['add-node', 'save-flow', 'load-flow']);

// 节点类型列表
const nodeTypes = [
  { type: 'task', label: '任务节点', icon: 'el-icon-s-order', color: '#1976d2' },
  { type: 'condition', label: '条件节点', icon: 'el-icon-s-operation', color: '#ff9800' },
  { type: 'end', label: '结束节点', icon: 'el-icon-circle-close', color: '#f44336' }
];

// 添加节点
const handleAddNode = (type: string) => {
  emit('add-node', type);
};
</script>

<template>
  <div class="flow-toolbar">
    <h3>节点工具箱</h3>
    <div class="toolbar-nodes">
      <el-tooltip 
        v-for="node in nodeTypes" 
        :key="node.type"
        :content="node.label"
        placement="right"
      >
        <div 
          class="toolbar-node" 
          :style="{ borderColor: node.color }"
          @click="handleAddNode(node.type)"
        >
          <div class="node-icon" :style="{ color: node.color }">
            <i :class="node.icon"></i>
          </div>
          <div class="node-label">{{ node.label }}</div>
        </div>
      </el-tooltip>
    </div>
    
    <div class="toolbar-actions">
      <el-button size="small" type="primary" @click="emit('save-flow')">保存流程</el-button>
      <el-button size="small" type="info" @click="emit('load-flow')">加载流程</el-button>
    </div>
  </div>
</template>

<style scoped>
.flow-toolbar {
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 12px 10px;
}

.flow-toolbar h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 15px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

.toolbar-nodes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.toolbar-node {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  width: 100%;
}

.toolbar-node:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #f0f5ff;
  border-color: #409eff;
}

.node-icon {
  margin-right: 10px;
  font-size: 18px;
}

.node-label {
  font-size: 14px;
}

.toolbar-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.toolbar-actions .el-button {
  width: 100%;
  height: 36px;
  font-size: 14px;
}
</style>