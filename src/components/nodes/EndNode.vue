<script setup lang="ts">
defineProps(['data', 'label']);
</script>

<template>
  <div class="end-node">
    <div class="node-header">{{ label || '结束' }}</div>
    <div class="node-content">{{ data.description }}</div>
  </div>
</template>

<style scoped>
.end-node {
  padding: 10px;
  border-radius: 5px;
  background: white;
  border: 2px solid #f44336;
  width: 180px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.node-header {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.node-content {
  font-size: 12px;
  color: #666;
}
</style>