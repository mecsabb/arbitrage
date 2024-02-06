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

    def bellman_ford(self, source):
        """
        Executes the Bellman-Ford algorithm on the graph from a given source node,
        and measures the time it takes to execute.
        
        Returns a tuple with the execution time followed by two dictionaries 
        representing the distance to each node and the predecessor of each node.
        """
        # Check if the source node is in the graph
        if source not in self.graph.nodes:
            raise ValueError("Source node not found in graph")

        start_time = time.time()

        # Prepare the distance and predecessor for each node
        distance = {node: float('inf') for node in self.graph.nodes}
        predecessor = {node: None for node in self.graph.nodes}
        distance[source] = 0

        # Relax the edges
        for _ in range(len(self.graph) - 1):
            for u, v, attr in self.graph.edges(data=True):
                weight = attr['weight']
                if distance[u] + weight < distance[v]:
                    distance[v] = distance[u] + weight
                    predecessor[v] = u

        # Check for negative weight cycles
        for u, v, attr in self.graph.edges(data=True):
            weight = attr['weight']
            if distance[u] + weight < distance[v]:
                end_time = time.time()
                print(
                    f"Execution time before detecting negative cycle: {end_time - start_time:.5f} seconds")
                raise nx.NetworkXUnbounded(
                    "Graph contains a negative weight cycle.")

        end_time = time.time()
        execution_time = end_time - start_time

        return execution_time, distance, predecessor

    # What else is convenient / needed?

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

if __name__ == '__main__':
    # Create a custom graph and add nodes and edges
    try:
        g = Graph()
        g.add_node("A")
        g.add_node("B")
        g.add_node("C")

        g.add_edge("A", "B", -1)
        g.add_edge("B", "C", 4)
        g.add_edge("A", "C", 3)

        # Run the Bellman-Ford algorithm
        execution_time, distance, predecessor = g.bellman_ford("A")

        print(f"Bellman-Ford algorithm executed in {execution_time:.5f} seconds")
        print("Distance:", distance)
        print("Predecessor:", predecessor)

    except Exception as e:
        print(f"An error occurred: {e}")


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

