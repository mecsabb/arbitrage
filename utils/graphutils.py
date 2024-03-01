'''
graphutils - a utility module containing our main graph class definiton some useful functions
'''

import torch
from torch_geometric.data import Data
import random
import string
import time
import torch_geometric
import networkx as nx
import matplotlib.pyplot as plt
import numpy as np

class Graph:
    def __init__(self):
        self.data = Data(x = None, edge_index = None, edge_attr = None)    
    def add_node(self, name):
        self.graph.add_node(name)
    
    def add_edge(self, u, v, weight=1):
        # u, v are nodes
        edge_index = torch.tensor([[u, v], [v, u]], dtype=torch.long)
        edge_attr = torch.tensor([weight, weight], dtype=torch.float)  
        self.data.edge_index = torch.cat([self.data.edge_index, edge_index], dim=1) if self.data.edge_index is not None else edge_index
        self.data.edge_attr = torch.cat([self.data.edge_attr, edge_attr]) if self.data.edge_attr is not None else edge_attr

class GraphGenerator:
    def __init__(self, min_weight=1.0, max_weight=10.0, max_nodes=26):
        if min_weight > max_weight:
            raise ValueError("Minimum weight cannot be greater than maximum weight")
        self.min_weight = min_weight
        self.max_weight = max_weight
        self.max_nodes = max_nodes

    def _generate_node_name(self, index):
        """
        Generates a node name based on the index. For indices greater than 26,
        it starts combining letters.
        """
        if index < 26:
            return string.ascii_uppercase[index]
        else:
            return self._generate_node_name(index // 26 - 1) + self._generate_node_name(index % 26)

    def generate_graph(self, num_nodes, num_edges):
        """
        Generates a graph with the specified number of nodes and edges.
        """
        if num_nodes > self.max_nodes:
            raise ValueError("Number of nodes exceeds maximum allowed nodes.")

        graph = Graph()

        # Add nodes
        for i in range(num_nodes):
            node_name = self._generate_node_name(i)
            graph.add_node(node_name)

        # Add edges
        all_possible_edges = [(u, v) for u in range(num_nodes) for v in range(num_nodes) if u != v]
        random.shuffle(all_possible_edges)  # Shuffle to randomize edge selection

        for _ in range(num_edges):
            if not all_possible_edges:
                break  # Break if there are no more possible edges to add
            u, v = all_possible_edges.pop()
            weight = random.uniform(self.min_weight, self.max_weight)
            graph.add_edge(u, v, weight)

        return graph

    def generate_fully_connected_graph(self, num_nodes):
        """
        Generates a fully connected graph with the specified number of nodes.
        Each pair of nodes will have edges in both directions with random weights.
        """
        if num_nodes > self.max_nodes:
            raise ValueError("Number of nodes exceeds maximum allowed nodes.")

        graph = Graph()

        # Add nodes
        for i in range(num_nodes):
            node_name = self._generate_node_name(i)
            graph.add_node(node_name)

        # Add edges in both directions for each pair of nodes
        for i in range(num_nodes):
            for j in range(num_nodes):
                if i != j:
                    weight = random.uniform(self.min_weight, self.max_weight)
                    graph.add_edge(self._generate_node_name(i), self._generate_node_name(j), weight)

        return graph

def create_random_graph(num_nodes, num_edges, num_node_features=1):
    # Initialize an empty set for unique edges
    unique_edges = set()
    
    # Keep generating edges until we have the desired number of unique edges
    while len(unique_edges) < num_edges:
        # Generate a random edge
        edge = tuple(np.random.choice(range(num_nodes), size=2, replace=False))
        
        # Check for self-loop (we already avoid it by using replace=False)
        # and if it's not already in the set, add the edge
        if edge[0] != edge[1]:
            unique_edges.add(edge)
    
    # Convert the set of edges to a NumPy array
    edge_list = np.array(list(unique_edges)).T
    
    # Convert to PyTorch tensor
    edge_index = torch.tensor(edge_list, dtype=torch.long)
    
    # Initialize node features to 0
    x = torch.zeros((num_nodes, num_node_features), dtype=torch.float)

    # Random edge weights - uniform on [-1, 1]
    attr = (-2)*torch.rand((num_edges, 1)) + 1

    # Create the PyG Data object
    data = Data(x=x, edge_index=edge_index, edge_attr=attr)
    
    return data

def print_graph(G, pos, node_labels=None, edge_labels=None, highlighted_nodes=None):

    # Clear the previous plot
    plt.clf()

    # Draw all nodes and edges
    nx.draw(G, pos, node_size=700, font_size=8, font_color='black', font_weight='bold')

    # Highlight specified nodes
    if highlighted_nodes is not None:
        nx.draw_networkx_nodes(G, pos, nodelist=highlighted_nodes, node_color='red', node_size=700)

    # Add edge labels
    if edge_labels is not None:
        edge_labels_dict = {(u, v): label.item() for (u, v), label in zip(G.edges(), edge_labels)}
        nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels_dict)

    # Add node labels
    if node_labels is not None:
        labels = {i: label for i, label in enumerate(node_labels)}
        nx.draw_networkx_labels(G, pos, labels=labels)

    # Plot graph 
    plt.draw()
    plt.pause(0.5)


def print_graph_example():

    edge_index = torch.tensor([[0, 1, 1, 0, 1, 2, 2, 2, 3, 3, 4, 4, 5], 
                               [1, 0, 3, 5, 2, 1, 3, 5, 2, 4, 3, 5, 4]], dtype=torch.long)  # Edgelist
    edge_labels = torch.tensor([23.5,12.3,4,5,23,5,5,2,3,56,53,5,2,5,3,3], dtype=torch.float)  # Edge labels
    x = torch.tensor([[-1], [0], [1], [2], [3], [4]], dtype=torch.float)  # Node features
    y = torch.tensor([101, 102, 103, 104, 105, 106], dtype=torch.long)  # Graph labels

    # Initialize the graph
    data = torch_geometric.data.Data(x=x, edge_index=edge_index, edge_attr=edge_labels, y=y)
    G = torch_geometric.utils.to_networkx(data, node_attrs=["x"], edge_attrs=["edge_attr"])
    pos = nx.spring_layout(G)
    
    # Assuming path contains the sequence of visited nodes
    path = [0, 1, 3,4, 5]

    plt.ion()
    
    for i in range(len(path)):
        print_graph(G, pos, node_labels=y.tolist(), edge_labels=edge_labels, highlighted_nodes=path[:i+1]) 

    plt.ioff()
    plt.show()
