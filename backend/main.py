from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import deque

app = FastAPI(title="VectorShift Pipeline Backend")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://vectorshiftyc.netlify.app",
]

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NodeSchema(BaseModel):
    id: str

class EdgeSchema(BaseModel):
    source: str
    target: str

class PipelineSchema(BaseModel):
    nodes: List[NodeSchema]
    edges: List[EdgeSchema]

def is_directed_acyclic_graph(node_ids: List[str], edges: List[Dict[str, str]]) -> bool:
    """
    Kahn's Algorithm (BFS-based Topological Sort) to check for cycles in a graph.
    Returns True if graph is a Directed Acyclic Graph (DAG), False otherwise.
    """
    if not node_ids:
        return True

    node_set = set(node_ids)
    adj = {node_id: [] for node_id in node_set}
    in_degree = {node_id: 0 for node_id in node_set}

    # Populate adjacency list and in-degree counts
    for edge in edges:
        src = edge.get("source")
        tgt = edge.get("target")
        # Ensure we only track edges between registered nodes
        if src in node_set and tgt in node_set:
            adj[src].append(tgt)
            in_degree[tgt] += 1

    # Queue contains all nodes with in-degree of 0 (no incoming edges)
    queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
    visited_count = 0

    while queue:
        curr = queue.popleft()
        visited_count += 1
        
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # If the number of visited nodes equals the total node count, it's a DAG (no cycles)
    return visited_count == len(node_set)

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineSchema):
    node_ids = [node.id for node in pipeline.nodes]
    edges_list = [{"source": edge.source, "target": edge.target} for edge in pipeline.edges]
    
    num_nodes = len(node_ids)
    num_edges = len(edges_list)
    is_dag = is_directed_acyclic_graph(node_ids, edges_list)

    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag
    }
