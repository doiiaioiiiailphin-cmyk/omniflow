import React, { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useAppStore } from '../../stores/appStore'
import { AGENT_LABELS, AGENT_COLORS, DAGNode } from '../../../core/types'
import { GitBranch } from 'lucide-react'

function createFlowElements(dagNodes: DAGNode[]) {
  const gapX = 280
  const gapY = 100

  // Simple topological layout per layer
  const nodeLevels: Map<string, number> = new Map()
  const getLevel = (id: string, visited = new Set<string>()): number => {
    if (visited.has(id)) return 0
    visited.add(id)
    const node = dagNodes.find(n => n.id === id)
    if (!node || node.dependencies.length === 0) return 0
    return Math.max(...node.dependencies.map(d => getLevel(d, visited) + 1))
  }
  
  const levels = new Map<number, DAGNode[]>()
  dagNodes.forEach(n => {
    const lvl = getLevel(n.id)
    if (!levels.has(lvl)) levels.set(lvl, [])
    levels.get(lvl)!.push(n)
    nodeLevels.set(n.id, lvl)
  })

  const flowNodes: Node[] = []
  const flowEdges: Edge[] = []
  let nodeId = 0

  const sortedLevels = Array.from(levels.keys()).sort((a, b) => a - b)
  
  sortedLevels.forEach(lvl => {
    const nodesInLvl = levels.get(lvl)!
    nodesInLvl.forEach((dn, idx) => {
      const x = lvl * gapX + 40
      const y = idx * gapY + 40
      const id = `node-${nodeId++}`
      
      flowNodes.push({
        id,
        position: { x, y },
        data: {
          label: (
            <div
              className="px-3 py-2 rounded-lg border text-xs min-w-[160px]"
              style={{
                backgroundColor: dn.status === 'completed' ? `${AGENT_COLORS[dn.agentType]}20` : '#1e293b',
                borderColor: AGENT_COLORS[dn.agentType],
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: dn.status === 'running' ? '#22c55e' : dn.status === 'completed' ? '#3b82f6' : dn.status === 'failed' ? '#ef4444' : '#64748b',
                  }}
                />
                <span className="font-semibold text-surface-200" style={{ color: AGENT_COLORS[dn.agentType] }}>
                  {AGENT_LABELS[dn.agentType]}
                </span>
              </div>
              <p className="text-surface-400 leading-relaxed">{dn.task}</p>
              {dn.status === 'running' && (
                <div className="flex gap-1 mt-1.5">
                  <div className="w-1 h-1 rounded-full bg-green-400 animate-bounce" />
                  <div className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
              {dn.status === 'completed' && (
                <div className="text-green-400 text-[10px] mt-1">✓ 完成</div>
              )}
              {dn.status === 'failed' && (
                <div className="text-red-400 text-[10px] mt-1">✗ 失败</div>
              )}
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none' },
      })

      const edgeIdPrefix = id
      dn.dependencies.forEach(depId => {
        const depNodeIdx = dagNodes.findIndex(n => n.id === depId)
        if (depNodeIdx >= 0) {
          flowEdges.push({
            id: `${edgeIdPrefix}-${depId}`,
            source: `node-${depNodeIdx}`,
            target: id,
            animated: dn.status === 'running',
            style: { stroke: '#475569', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
          })
        }
      })
    })
  })

  return { flowNodes, flowEdges }
}

const DAGFlow: React.FC = () => {
  const { currentDAG } = useAppStore()
  const dagNodes = currentDAG?.nodes || []

  const { flowNodes, flowEdges } = useMemo(() => createFlowElements(dagNodes), [dagNodes])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  React.useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges])

  if (dagNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-500 p-4">
        <GitBranch size={40} className="text-surface-600 mb-3" />
        <p className="text-sm text-center">DAG 工作流</p>
        <p className="text-xs text-center mt-1">提交任务后将在此展示 Agent 协作流程</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="h-8 bg-surface-900 border-b border-surface-800 flex items-center px-3">
        <span className="text-xs text-surface-400 font-medium">任务工作流 (DAG)</span>
      </div>
      <div className="h-[calc(100%-2rem)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={false}
          zoomOnScroll={true}
        >
          <Background color="#1e293b" gap={20} />
          <Controls className="!bg-surface-800 !border-surface-700 !rounded-lg" />
          <MiniMap
            nodeColor={(n: Node) => {
              const bg = (n.data?.label as React.ReactElement)?.props?.style?.backgroundColor || '#1e293b'
              return bg
            }}
            maskColor="rgba(2,6,23,0.8)"
            className="!bg-surface-900 !border-surface-800"
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export default DAGFlow
