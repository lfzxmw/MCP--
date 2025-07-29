<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import type { NodeMouseEvent, Connection, NodeDragEvent, VueFlowStore } from '@vue-flow/core';
import { Panel } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import { ElInput, ElButton, ElDialog, ElForm, ElFormItem, ElSelect, ElOption, ElMessage } from 'element-plus';

// 导入自定义节点组件
import TaskNode from './nodes/TaskNode.vue';
import ConditionNode from './nodes/ConditionNode.vue';
import StartNode from './nodes/StartNode.vue';
import EndNode from './nodes/EndNode.vue';
import FlowToolbar from './FlowToolbar.vue';
import SmartInput from './SmartInput.vue';

// 定义节点类型
const nodeTypes = {
  task: TaskNode,
  condition: ConditionNode,
  start: StartNode,
  end: EndNode
};

// 使用Vue Flow的hooks
const { 
  nodes, 
  edges, 
  addNodes, 
  addEdges, 
  onConnect, 
  onNodeDragStop,
  onPaneReady,
  findNode,
  setNodes,
  setEdges,
  updateNode
} = useVueFlow();

// 新节点的表单数据
const newNodeForm = ref({
  type: 'task',
  label: '',
  description: ''
});

// 对话框控制
const addNodeDialogVisible = ref(false);

// 编辑节点对话框
const selectedNode = ref<any>(null);
const editNodeDialogVisible = ref(false);

// 计算属性：处理选中节点的属性
const selectedNodeDescription = computed({
  get: () => selectedNode.value?.data?.description || '',
  set: (val: string) => {
    if (selectedNode.value && selectedNode.value.data) {
      selectedNode.value.data.description = val;
    }
  }
});

const selectedNodeLabel = computed({
  get: () => selectedNode.value?.label || '',
  set: (val: string) => {
    if (selectedNode.value) {
      selectedNode.value.label = val;
    }
  }
});

// 初始化流程图
onMounted(() => {
  // 添加初始节点
  addNodes([
    {
      id: 'start',
      type: 'start',
      label: '开始',
      position: { x: 250, y: 5 },
      data: { type: 'start', description: '流程开始点' }
    }
  ]);
});

// 添加新节点
const addNewNode = () => {
  // 验证必填字段
  if (!newNodeForm.value.label.trim()) {
    ElMessage.warning('节点名称不能为空');
    return;
  }
  
  const newNodeId = `node-${Date.now()}`;
  const lastNodeId = nodes.value.length > 0 ? nodes.value[nodes.value.length - 1].id : null;
  
  // 计算新节点位置
  const position = { x: 250, y: nodes.value.length * 100 + 50 };
  
  // 创建新节点
  const newNode = {
    id: newNodeId,
    type: newNodeForm.value.type, // 直接使用节点类型
    label: newNodeForm.value.label.trim(),
    position,
    data: { 
      type: newNodeForm.value.type,
      description: newNodeForm.value.description.trim() 
    }
  };
  
  addNodes([newNode]);
  
  // 如果有上一个节点，则连接它们
  if (lastNodeId) {
    addEdges([{
      id: `edge-${lastNodeId}-${newNodeId}`,
      source: lastNodeId,
      target: newNodeId,
      type: 'smoothstep'
    }]);
  }
  
  // 重置表单
  newNodeForm.value = {
    type: 'task',
    label: '',
    description: ''
  };
  
  addNodeDialogVisible.value = false;
};

// 处理节点点击事件
const onNodeClick = (event: NodeMouseEvent) => {
  if (event && event.node) {
    selectedNode.value = event.node;
    editNodeDialogVisible.value = true;
  }
};

// 更新节点
const updateSelectedNode = () => {
  if (selectedNode.value && selectedNode.value.id) {
    // 验证必填字段
    if (!selectedNode.value.label || !selectedNode.value.label.trim()) {
      ElMessage.warning('节点名称不能为空');
      return;
    }
    
    const nodeData = {
      ...selectedNode.value,
      label: selectedNode.value.label.trim(),
      data: {
        ...selectedNode.value.data,
        description: selectedNode.value.data.description ? selectedNode.value.data.description.trim() : ''
      }
    };
    
    updateNode(selectedNode.value.id, nodeData);
    editNodeDialogVisible.value = false;
  }
};

// 删除节点
const deleteSelectedNode = () => {
  if (selectedNode.value && selectedNode.value.id) {
    const nodeId = selectedNode.value.id;
    
    // 过滤掉要删除的节点
    setNodes(nodes.value.filter((node: any) => node.id !== nodeId));
    
    // 过滤掉与该节点相关的边
    setEdges(edges.value.filter((edge: any) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    editNodeDialogVisible.value = false;
  }
};

// 保存流程图
const saveFlow = () => {
  const flowData = {
    nodes: nodes.value,
    edges: edges.value
  };
  
  localStorage.setItem('taskFlow', JSON.stringify(flowData));
  alert('流程图已保存');
};

// 加载流程图
const loadFlow = () => {
  const savedFlow = localStorage.getItem('taskFlow');
  if (savedFlow) {
    const flowData = JSON.parse(savedFlow);
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
  }
};
</script>

<template>
  <div class="task-flow-container">
    <div class="flow-header">
      <h3>任务规划流程图</h3>
      <div class="flow-actions">
        <el-button size="small" type="primary" @click="addNodeDialogVisible = true">添加节点</el-button>
      </div>
    </div>
    
    <div class="flow-layout">
      <!-- 工具栏 -->
      <div class="flow-sidebar">
        <FlowToolbar 
          @add-node="(type) => { newNodeForm.type = type; addNodeDialogVisible = true; }"
          @save-flow="saveFlow"
          @load-flow="loadFlow"
        />
      </div>
      
      <div class="flow-canvas">
        <VueFlow
          @node-click="onNodeClick"
          @connect="(params) => onConnect(params)"
          @node-drag-stop="(params) => onNodeDragStop(params)"
          @pane-ready="(params) => onPaneReady(params)"
          :default-zoom="1"
          :min-zoom="0.2"
          :max-zoom="4"
          :node-types="nodeTypes as any"
        >
          <Background pattern-color="#aaa" gap="25" size="1.5" />
          <MiniMap :height="140" :width="180" :min-zoom="0.2" :max-zoom="4" />
          <Controls />
          <Panel position="top-right">
            <div class="flow-legend">
              <div class="legend-item">
                <div class="legend-color" style="background-color: #1976d2;"></div>
                <span>任务节点</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #ff9800;"></div>
                <span>条件节点</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #4caf50;"></div>
                <span>开始节点</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background-color: #f44336;"></div>
                <span>结束节点</span>
              </div>
            </div>
          </Panel>
        </VueFlow>
      </div>
    
    <!-- 添加节点对话框 -->
    <el-dialog v-model="addNodeDialogVisible" title="添加新节点" width="25%">
      <el-form :model="newNodeForm" label-width="80px">
        <el-form-item label="节点类型">
          <el-select v-model="newNodeForm.type" placeholder="选择节点类型">
            <el-option label="任务" value="task"></el-option>
            <el-option label="条件" value="condition"></el-option>
            <el-option label="结束" value="end"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="节点名称">
          <el-input v-model="newNodeForm.label" placeholder="输入节点名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <SmartInput 
            v-model="newNodeForm.description" 
            placeholder="输入节点描述，点击智能分析获取建议"
            @analyze="suggestions => console.log('分析结果:', suggestions)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addNodeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addNewNode">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑节点对话框 -->
    <el-dialog v-model="editNodeDialogVisible" title="编辑节点" width="25%">
      <el-form v-if="selectedNode" label-width="80px">
        <el-form-item label="节点名称">
          <el-input v-model="selectedNodeLabel" placeholder="输入节点名称"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <SmartInput 
            v-model="selectedNodeDescription" 
            placeholder="输入节点描述，点击智能分析获取建议"
            @analyze="(suggestions: any) => console.log('分析结果:', suggestions)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editNodeDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="deleteSelectedNode">删除</el-button>
          <el-button type="primary" @click="updateSelectedNode">保存</el-button>
        </span>
      </template>
    </el-dialog>
      </div>
  </div>
</template>

<style scoped>
.task-flow-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.flow-header {
  padding: 6px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  height: 50px;
}

.flow-actions {
  display: flex;
  gap: 10px;
}

.flow-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 50px);
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* 修改为hidden，让内部元素控制滚动 */
}

.flow-sidebar {
  width: 200px; /* 进一步增加侧边栏宽度，使工具栏内容更舒适 */
  border-right: 1px solid #eee;
  padding: 12px;
  overflow-y: auto;
  flex-shrink: 0;
}

.flow-canvas {
  flex: 1;
  width: 1000px;
  height: 100%;
  overflow: auto; /* 允许滚动 */
}

/* 增加流程图的宽度 */
:deep(.vue-flow) {
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__container) {
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__pane) {
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__transformationpane) {
  width: 100%;
  height: 100%;
}

:deep(.vue-flow__minimap) {
  width: 180px; /* 增加小地图宽度 */
  height: 140px; /* 增加小地图高度 */
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  right: 12px;
  top: 12px;
}

:deep(.vue-flow__controls) {
  bottom: 15px;
  right: 15px;
  top: auto;
  left: auto;
  transform: scale(1.1);
  transform-origin: bottom right;
}

.flow-node {
  padding: 12px;
  border-radius: 8px;
  background: white;
  border: 1px solid #1976d2;
  width: 220px; /* 进一步增加节点宽度，使内容更易读 */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.node-type-condition {
  border-color: #ff9800;
}

.node-type-start {
  border-color: #4caf50;
}

.node-type-end {
  border-color: #f44336;
}

.node-header {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  font-size: 15px;
}

.node-content {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
}

.flow-legend {
  background: white;
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  padding: 2px 0;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 8px;
}
</style>